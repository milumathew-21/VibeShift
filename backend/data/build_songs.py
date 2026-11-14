# build_songs.py
# Reads the big Kaggle file and makes a small songs.csv for VibeShift.

import pandas as pd
from pathlib import Path

# Where the big file is (it stays in Downloads, never in the project)
SOURCE = Path(r"C:\Users\NETHRA\Downloads\archive\spotify_tracks.csv")
# Where the new small song list will be saved (next to this script)
OUTPUT = Path(__file__).parent / "songs.csv"

LANGUAGES = ["Malayalam", "Hindi", "Tamil", "English"]
SONGS_PER_LANGUAGE = 100


def moods_for(valence, energy):
    """Guess mood tags from two numbers (0 to 1). These are estimates only."""
    if energy >= 0.7 and valence < 0.35:
        main = "angry"
    elif valence >= 0.6 and energy >= 0.4:
        main = "happy"
    elif energy >= 0.7:
        main = "energetic"
    elif energy < 0.4 and valence >= 0.4:
        main = "calm"
    elif valence < 0.35:
        main = "sad"
    else:
        main = "neutral"
    tags = [main]
    if energy < 0.45 and main != "calm":
        tags.append("calm")
    elif energy >= 0.65 and main != "energetic":
        tags.append("energetic")
    return "|".join(tags)


def contexts_for(row):
    """Guess listening contexts from the audio numbers. Estimates only."""
    tags = []
    if row["energy"] < 0.3:
        tags.append("sleep")
    if row["energy"] < 0.5:
        tags.append("relax")
    if row["energy"] < 0.5 and row["speechiness"] < 0.1:
        tags.append("study")
    if row["energy"] >= 0.7 and row["tempo"] >= 110:
        tags.append("workout")
    if row["danceability"] >= 0.65 and row["energy"] >= 0.6:
        tags.append("party")
    if 0.45 <= row["energy"] < 0.75 and row["valence"] >= 0.4:
        tags.append("travel")
    if not tags:
        tags.append("travel")
    return "|".join(tags)


def genre_for(row):
    """Guess a genre label from the audio numbers. Estimate only."""
    if row["acousticness"] >= 0.8 and row["energy"] < 0.35:
        return "Classical"
    if row["danceability"] >= 0.7 and row["energy"] >= 0.65:
        return "Dance"
    if row["energy"] >= 0.75 and row["danceability"] < 0.6:
        return "Rock"
    if row["energy"] < 0.55:
        return "Melody"
    return "Pop"


df = pd.read_csv(SOURCE)

# Keep only our 4 languages
df = df[df["language"].isin(LANGUAGES)]

# Remove rows that miss important information
needed = ["track_name", "artist_name", "track_url", "valence", "energy",
          "danceability", "tempo", "speechiness", "acousticness", "popularity"]
df = df.dropna(subset=needed)

# Remove duplicate songs (same title and artist)
df["_key"] = (df["track_name"].str.lower().str.strip() + "|"
              + df["artist_name"].str.lower().str.strip())
df = df.drop_duplicates(subset="_key")

# Take the most popular songs for each language
df = df.sort_values("popularity", ascending=False)
df = df.groupby("language").head(SONGS_PER_LANGUAGE)
df = df.sort_values(["language", "popularity"], ascending=[True, False])
df = df.reset_index(drop=True)

# Build the table in the same columns VibeShift already uses
out = pd.DataFrame({
    "id": range(1, len(df) + 1),
    "title": df["track_name"],
    "artist": df["artist_name"],
    "language": df["language"],
    "genre": df.apply(genre_for, axis=1),
    "mood_tags": [moods_for(v, e) for v, e in zip(df["valence"], df["energy"])],
    "context_tags": df.apply(contexts_for, axis=1),
    "audio_url": df["track_url"],
})

out.to_csv(OUTPUT, index=False)

print("Saved", len(out), "songs to", OUTPUT)
print(out["language"].value_counts())
print(out["mood_tags"].str.split("|").str[0].value_counts())
print(out["genre"].value_counts())