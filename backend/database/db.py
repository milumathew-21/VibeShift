"""
VibeShift - Database Management Module
Handles SQLite connection, table initialization, and initial CSV data loading.
"""

import sqlite3
from pathlib import Path
import pandas as pd

# Define paths for the SQLite database file and the songs CSV file
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "vibeshift.db"
CSV_PATH = BASE_DIR / "data" / "songs.csv"


def get_db_connection():
    """
    Creates and returns a connection to the SQLite database.
    Sets row_factory to sqlite3.Row so columns can be accessed by name.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign key constraints in SQLite
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """
    Creates necessary database tables if they do not already exist:
    - songs: Stores song catalog metadata
    - sessions: Stores user listening sessions
    - mood_records: Stores mood history for each session
    - feedback: Stores user actions (like, skip, replay) for recommendations
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Table for songs
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            language TEXT NOT NULL,
            genre TEXT NOT NULL,
            mood_tags TEXT NOT NULL,
            context_tags TEXT NOT NULL,
            audio_url TEXT NOT NULL
        );
        """
    )

    # 2. Table for listening sessions
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # 3. Table for session mood history
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS mood_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            mood TEXT NOT NULL,
            confidence REAL DEFAULT 1.0,
            source TEXT DEFAULT 'manual',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
        );
        """
    )

    # 4. Table for user feedback on songs
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            song_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE SET NULL,
            FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
        );
        """
    )

    conn.commit()
    conn.close()


def load_songs_csv_if_empty():
    """
    Loads songs from songs.csv into the songs table using Pandas
    only if the songs table is currently empty.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if songs table already has data
    cursor.execute("SELECT COUNT(*) AS total FROM songs")
    row = cursor.fetchone()
    count = row["total"] if row else 0

    if count == 0:
        if CSV_PATH.exists():
            # Read CSV using pandas
            df = pd.read_csv(CSV_PATH)
            # Write to SQLite database
            df.to_sql("songs", conn, if_exists="append", index=False)
            print(f"[DB] Successfully loaded {len(df)} songs from CSV into database.")
        else:
            print(f"[DB] Warning: CSV file not found at {CSV_PATH}")
    else:
        print(f"[DB] Songs table already contains {count} records. Skipping CSV load.")

    conn.close()

