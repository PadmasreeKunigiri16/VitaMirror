# VitaMirror – AI-Powered Health Mirror

> **⚠️ Educational / Demo Application.** VitaMirror does not diagnose medical conditions, mental health disorders, or skin diseases. Always consult a qualified healthcare professional.

---

## Project Overview

VitaMirror is a full-stack wellness application that uses computer vision (OpenCV + MediaPipe) to analyze visible facial cues from a webcam and provide **non-diagnostic, experimental wellness indicators** for:

- **Fatigue** – based on Eye Aspect Ratio (EAR) and blink-related observations
- **Stress-related signals** – experimental brow tension proxy (clearly labeled)
- **Skin observations** – brightness, texture variation, color uniformity, redness

Results are displayed in a modern React dashboard and optionally saved to a local SQLite database.

---

## Features

- 🎥 Real-time webcam capture and analysis
- 👁️ 468-landmark face mesh (MediaPipe FaceMesh)
- 📊 Live indicator dashboard with trend charts
- 💾 Local SQLite history with delete controls
- 🔒 Privacy-first: no images stored
- 📱 Responsive design (mobile + desktop)
- 🧪 Pytest backend tests + Playwright E2E tests
- 📖 OpenAPI / Swagger documentation

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Python 3.11+, FastAPI, Uvicorn |
| Computer Vision | OpenCV (headless), MediaPipe, NumPy |
| Database | SQLite + SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Frontend | React 18, TypeScript, Vite |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend Tests | Pytest, httpx |
| Frontend Tests | Playwright |

---

## Architecture

```
VitaMirror/
├── backend/
│   ├── app/
│   │   ├── api/          ← FastAPI route handlers
│   │   │   ├── health.py
│   │   │   └── wellness.py
│   │   ├── core/         ← Configuration
│   │   │   └── config.py
│   │   ├── database/     ← SQLAlchemy session
│   │   │   └── session.py
│   │   ├── models/       ← ORM models
│   │   │   └── wellness.py
│   │   ├── schemas/      ← Pydantic schemas
│   │   │   └── wellness.py
│   │   ├── services/     ← Business logic
│   │   │   └── wellness_service.py
│   │   ├── vision/       ← Computer vision pipeline
│   │   │   ├── pipeline.py        ← Orchestrator
│   │   │   ├── preprocessor.py    ← Frame decode/resize
│   │   │   ├── landmark_analyzer.py  ← MediaPipe EAR/brow
│   │   │   └── skin_analyzer.py   ← Skin ROI analysis
│   │   └── main.py       ← FastAPI app entry point
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   ├── test_wellness_api.py
│   │   └── test_vision_pipeline.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/   ← Navbar, CameraView, IndicatorBadge
│   │   ├── hooks/        ← useCamera, useWellnessAnalysis
│   │   ├── pages/        ← Landing, Dashboard, Check, Result, History, Privacy
│   │   ├── services/     ← api.ts (Axios)
│   │   └── types/        ← wellness.ts TypeScript types
│   ├── tests/e2e/        ← Playwright tests
│   └── vite.config.ts
│
├── docs/
│   ├── 03-computer-vision.md
│   ├── 04-api-documentation.md
│   ├── 05-database-design.md
│   └── 07-privacy-and-limitations.md
└── README.md
```

---

## Computer Vision Workflow

```
Browser captures JPEG frame
        ↓
POST /api/wellness/analyze  (base64 JSON)
        ↓
1. OpenCV: decode + resize to 640×480
2. Lighting quality: HSV V-channel luminance
3. MediaPipe FaceMesh: 468 landmarks
4. EAR (Eye Aspect Ratio) → fatigue indicator
5. Brow tension proxy → stress indicator
6. Skin ROI: brightness, texture, color, redness
7. Overall wellness label
        ↓
JSON response with all indicators + disclaimer
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/wellness/analyze` | Analyze a webcam frame |
| POST | `/api/wellness/checks` | Save a wellness check |
| GET | `/api/wellness/checks` | List checks (newest first) |
| GET | `/api/wellness/checks/{id}` | Get a single check |
| DELETE | `/api/wellness/checks/{id}` | Delete a check |

Swagger UI: `http://localhost:8000/docs`

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Start the backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Running the Application

### Step 1 – Start the backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```
Backend will start on `http://localhost:8000`

### Step 2 – Start the frontend
```bash
cd frontend
npm run dev
```
Frontend will start on `http://localhost:5173`

### Step 3 – Open the app
Navigate to **http://localhost:5173**

---

## Testing

### Backend Tests (Pytest)

```bash
cd backend
python -m pytest tests/ -v
```

Expected output:
- `test_health.py` – 3 tests
- `test_wellness_api.py` – 8 tests  
- `test_vision_pipeline.py` – 5 tests

### Frontend E2E Tests (Playwright)

> Note: Both frontend and backend must be running before E2E tests.

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install chromium

# Run tests
npx playwright test

# View HTML report
npx playwright show-report
```

---

## Environment Variables

Backend (optional `.env` file in `/backend`):

```env
DATABASE_URL=sqlite:///./vitamirror.db
DEBUG=false
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

Frontend (optional `.env` in `/frontend`):

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Privacy

- **No raw images stored**: Camera frames are analyzed and immediately discarded
- **Local only**: All data stays on your machine (SQLite)
- **Delete anytime**: Use the Privacy page to delete all history
- **HTTPS recommended** for production deployment

See [docs/07-privacy-and-limitations.md](docs/07-privacy-and-limitations.md) for full details.

---

## Limitations

| Limitation | Description |
|------------|-------------|
| Non-clinical | All indicators are experimental, not clinically validated |
| Lighting dependent | Poor lighting significantly affects all readings |
| Camera quality | Low-resolution cameras produce less accurate results |
| Single user | No authentication in v1 |
| Local only | No cloud deployment in v1 |
| Glasses/contacts | May affect EAR accuracy |

---

## Future Enhancements

- [ ] Optional user authentication
- [ ] Cloud deployment (Docker + PostgreSQL)
- [ ] Temporal analysis (multi-frame averaging)
- [ ] Wearable device integration
- [ ] Better ML models for fatigue/stress
- [ ] Multilingual UI
- [ ] Export wellness data as CSV
- [ ] Personalized baseline calibration

---

## Documentation

| File | Content |
|------|---------|
| [03-computer-vision.md](docs/03-computer-vision.md) | CV pipeline technical details |
| [04-api-documentation.md](docs/04-api-documentation.md) | Full API reference |
| [05-database-design.md](docs/05-database-design.md) | Database schema and design |
| [07-privacy-and-limitations.md](docs/07-privacy-and-limitations.md) | Privacy & medical limitations |

---

## Development Summary

**What was built:** A complete full-stack wellness application with real computer vision pipeline.

**Backend:** FastAPI + OpenCV + MediaPipe FaceMesh + SQLAlchemy/SQLite  
**Frontend:** React 18 + TypeScript + Vite + Recharts + Axios  
**API:** 6 REST endpoints with Pydantic v2 validation  
**Tests:** Pytest (16 tests) + Playwright E2E (15 scenarios)

**Important URLs:**
- App: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

---

*Built with Python · FastAPI · OpenCV · MediaPipe · React · TypeScript*
