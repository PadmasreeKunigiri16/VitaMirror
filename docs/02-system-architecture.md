# VitaMirror – System Architecture

## Overview

VitaMirror follows a clean client-server architecture with a strict separation between the frontend UI, the backend API, and the computer vision pipeline.

```
┌──────────────────────────────────────────────────────┐
│                    Browser (React)                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Webcam  │  │  Pages   │  │   Services/Hooks   │ │
│  │  (HTML5) │  │  (React) │  │   (Axios + State)  │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│         │              │              │               │
│         └──────────────┼──────────────┘               │
│                        │                             │
│              Base64 JPEG + JSON                      │
└──────────────────────────┼───────────────────────────┘
                           │ HTTP (localhost:8000)
┌──────────────────────────▼───────────────────────────┐
│                FastAPI Backend                       │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              API Layer (Routers)                │ │
│  │     /api/health    /api/wellness/*              │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │                           │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │           Service Layer (Business Logic)        │ │
│  │         WellnessService (CRUD ops)              │ │
│  └──────┬──────────────────────────────────────────┘ │
│         │                                           │
│  ┌──────▼──────┐    ┌───────────────────────────┐   │
│  │  SQLAlchemy │    │  Vision Pipeline          │   │
│  │  SQLite DB  │    │  preprocessor.py          │   │
│  │             │    │  landmark_analyzer.py     │   │
│  │  vitamirror │    │  skin_analyzer.py         │   │
│  │    .db      │    │  pipeline.py (orchestrate)│   │
│  └─────────────┘    └───────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend
| Component | Responsibility |
|-----------|---------------|
| `useCamera` hook | Manage MediaStream, capture frames |
| `useWellnessAnalysis` hook | Send frames to API, manage state |
| `CameraView` | Live video preview, face detection overlay |
| `IndicatorBadge` | Level-colored badge (low/moderate/elevated) |
| `api.ts` | Axios wrapper for all backend endpoints |

### Backend API Layer
| Module | Responsibility |
|--------|---------------|
| `api/health.py` | Simple health check endpoint |
| `api/wellness.py` | Analyze frame + CRUD for checks |

### Vision Pipeline
| Module | Responsibility |
|--------|---------------|
| `preprocessor.py` | Decode base64, resize, assess lighting |
| `landmark_analyzer.py` | MediaPipe FaceMesh: EAR, brow tension |
| `skin_analyzer.py` | Face ROI: brightness, texture, color |
| `pipeline.py` | Orchestrate all steps, return unified dict |

### Data Layer
| Module | Responsibility |
|--------|---------------|
| `database/session.py` | Engine, SessionLocal, table creation |
| `models/wellness.py` | WellnessCheck ORM model |
| `schemas/wellness.py` | Pydantic input/output validation |
| `services/wellness_service.py` | CRUD operations |

## Data Flow – Wellness Analysis

1. User clicks "Start Analysis" in browser
2. `useCamera.captureFrame()` renders video to canvas → JPEG base64
3. `analyzeFrame(frameB64)` POSTs to `POST /api/wellness/analyze`
4. Backend: decode → resize → lighting → FaceMesh → skin → overall label
5. Response JSON with all indicators returned
6. Frontend updates live indicator sidebar
7. User clicks "Complete" → optionally saves to DB via `POST /api/wellness/checks`
8. Navigate to result page

## Request Size Limits

- Max frame size: 5 MB (decoded)
- Max history page: 100 records
- Analysis timeout: 30 seconds
