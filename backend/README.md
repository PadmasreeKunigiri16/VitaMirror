# VitaMirror Backend

## Overview
FastAPI backend providing the computer vision analysis pipeline and wellness data storage.

## Tech Stack
- Python 3.11+
- FastAPI + Uvicorn
- OpenCV (headless) + MediaPipe
- SQLAlchemy + SQLite
- Pydantic v2

## Setup

```bash
# Install dependencies
python -m pip install -r requirements.txt

# Start server (development)
python -m uvicorn app.main:app --reload --port 8000

# Start server (production)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Docs
Visit `http://localhost:8000/docs` for interactive Swagger UI.

## Project Structure

```
app/
├── api/           ← Route handlers (health, wellness)
├── core/          ← Settings (pydantic-settings)
├── database/      ← SQLAlchemy session + table creation
├── models/        ← ORM models (WellnessCheck)
├── schemas/       ← Pydantic request/response models
├── services/      ← Business logic (CRUD)
├── vision/        ← Computer vision pipeline
│   ├── pipeline.py         ← Orchestrator
│   ├── preprocessor.py     ← Decode, resize, lighting
│   ├── landmark_analyzer.py ← MediaPipe EAR + brow
│   └── skin_analyzer.py    ← Skin ROI analysis
└── main.py        ← FastAPI app entry
```

## Running Tests

```bash
python -m pytest tests/ -v
```

## Environment Variables

Create a `.env` file (optional):

```env
DATABASE_URL=sqlite:///./vitamirror.db
DEBUG=false
CORS_ORIGINS=["http://localhost:5173"]
```
