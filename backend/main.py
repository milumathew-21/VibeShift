"""
VibeShift - Backend API
Main FastAPI application entry point with automatic database initialization and route registration.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in sys.path so submodules can be imported cleanly
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database.db import init_db, load_songs_csv_if_empty
from api.recommendations import router as recommendations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager:
    Initializes SQLite tables and loads songs.csv into the database on server startup.
    """
    print("[Startup] Initializing SQLite database...")
    init_db()
    print("[Startup] Checking and loading initial songs data...")
    load_songs_csv_if_empty()
    yield
    print("[Shutdown] VibeShift server shutting down.")


# Initialize FastAPI application with lifespan handler
app = FastAPI(
    title="VibeShift API",
    description="Backend API for VibeShift AI adaptive music recommendation web app",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS (Cross-Origin Resource Sharing)
# Allows the frontend React/Vite development server (running at http://localhost:5173) to call this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(recommendations_router)


@app.get("/api/health")
def health_check():
    """
    Health check endpoint to verify that the backend server is running properly.
    """
    return {"status": "ok"}
