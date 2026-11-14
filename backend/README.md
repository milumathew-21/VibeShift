# VibeShift Backend (Nethra)

FastAPI + SQLite backend for VibeShift. It recommends songs, stores
sessions, moods and feedback, and calls Milu's face-expression module.

## How to run (Windows)

Until the pull request is merged, use the branch `feature/backend-nethra`.

1. Open a terminal in the project root (the `VibeShift` folder).
2. Create a virtual environment:

       python -m venv backend\venv

3. Install PyTorch (CPU version). This is a large download:

       backend\venv\Scripts\python.exe -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

4. Install the other packages:

       backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt

5. Start the server:

       backend\venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000

6. Open http://127.0.0.1:8000/docs to see and try every endpoint.

The first start takes 30 to 60 seconds because PyTorch loads.
The database file is created automatically from `backend/data/songs.csv`.

## Important notes

- OpenCV must be version 4 (`opencv-python-headless==4.14.0.94`).
  OpenCV 5 has no `CascadeClassifier`, so face detection fails with
  `face_detector_unavailable`.
- Do not commit the `venv` folder, `.db` files, API keys or personal photos.
- The full endpoint list is in `docs/API_CONTRACT.md`.