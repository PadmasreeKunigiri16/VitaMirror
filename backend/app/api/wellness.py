"""
Wellness API routes.

Endpoints:
  POST /api/wellness/analyze        – Run CV pipeline on a frame
  POST /api/wellness/checks         – Save a completed check
  GET  /api/wellness/checks         – List all checks
  GET  /api/wellness/checks/{id}    – Get a single check
  DELETE /api/wellness/checks/{id}  – Delete a check
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.wellness import (
    AnalyzeFrameRequest,
    AnalyzeFrameResponse,
    WellnessCheckCreate,
    WellnessCheckRead,
    WellnessCheckList,
    SkinObservations,
)
from app.services.wellness_service import (
    create_check,
    get_check,
    get_checks,
    delete_check,
)
from app.vision.pipeline import run_pipeline

router = APIRouter(prefix="/wellness", tags=["Wellness"])

DISCLAIMER = (
    "VitaMirror provides experimental, non-diagnostic wellness observations "
    "based on computer vision. It does not diagnose medical or psychological conditions. "
    "Consult a qualified healthcare professional for medical advice."
)


@router.post("/analyze", response_model=AnalyzeFrameResponse)
async def analyze_frame(request: AnalyzeFrameRequest):
    """
    Analyze a single webcam frame and return wellness indicators.

    Accepts a base64-encoded JPEG/PNG image.
    Returns non-diagnostic, experimental wellness indicators.
    """
    pipeline_result = run_pipeline(request.frame_data)

    # Build skin observations model if available
    skin_obs = None
    if pipeline_result.get("skin_observations"):
        raw = pipeline_result["skin_observations"]
        skin_obs = SkinObservations(
            brightness=raw.get("brightness", "unknown"),
            texture_variation=raw.get("texture_variation", "unknown"),
            color_uniformity=raw.get("color_uniformity", "unknown"),
            redness=raw.get("redness", "unknown"),
        )

    return AnalyzeFrameResponse(
        success=pipeline_result["success"],
        face_detected=pipeline_result["face_detected"],
        multiple_faces=pipeline_result.get("multiple_faces", False),
        lighting_quality=pipeline_result.get("lighting_quality", "unknown"),
        fatigue_level=pipeline_result.get("fatigue_level", "unknown"),
        stress_level=pipeline_result.get("stress_level", "unknown"),
        overall_wellness=pipeline_result.get("overall_wellness", "unknown"),
        ear_value=pipeline_result.get("ear_value"),
        blink_rate=pipeline_result.get("blink_rate"),
        brow_tension=pipeline_result.get("brow_tension"),
        skin_observations=skin_obs,
        status_message=pipeline_result.get("status_message", ""),
        disclaimer=DISCLAIMER,
        error=pipeline_result.get("error"),
    )


@router.post("/checks", response_model=WellnessCheckRead, status_code=status.HTTP_201_CREATED)
def save_check(data: WellnessCheckCreate, db: Session = Depends(get_db)):
    """Save a completed wellness check to the database."""
    db_check = create_check(db, data)
    return db_check


@router.get("/checks", response_model=WellnessCheckList)
def list_checks(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Return paginated list of wellness checks, newest first."""
    if limit > 100:
        limit = 100
    checks, total = get_checks(db, skip=skip, limit=limit)
    return WellnessCheckList(checks=checks, total=total)


@router.get("/checks/{check_id}", response_model=WellnessCheckRead)
def read_check(check_id: int, db: Session = Depends(get_db)):
    """Retrieve a single wellness check by ID."""
    db_check = get_check(db, check_id)
    if not db_check:
        raise HTTPException(status_code=404, detail=f"Wellness check {check_id} not found.")
    return db_check


@router.delete("/checks/{check_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_check(check_id: int, db: Session = Depends(get_db)):
    """Delete a wellness check by ID."""
    deleted = delete_check(db, check_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Wellness check {check_id} not found.")
