"""Pydantic schemas for VitaMirror API request / response validation."""
from __future__ import annotations
from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field, field_validator
import base64


# ─────────────────────────────────────────────
# Analysis request / response
# ─────────────────────────────────────────────

class AnalyzeFrameRequest(BaseModel):
    """A single webcam frame encoded as base64 JPEG/PNG."""

    frame_data: str = Field(
        ...,
        description="Base64-encoded image frame (JPEG or PNG, max 5 MB decoded)",
    )
    timestamp: Optional[datetime] = Field(
        default=None,
        description="Client-side timestamp when the frame was captured",
    )

    @field_validator("frame_data")
    @classmethod
    def validate_frame_size(cls, v: str) -> str:
        # Strip data URI prefix if present
        if "," in v:
            v = v.split(",", 1)[1]
        decoded_size = len(base64.b64decode(v, validate=False))
        if decoded_size > 5 * 1024 * 1024:
            raise ValueError("Frame data exceeds 5 MB limit")
        return v


class SkinObservations(BaseModel):
    brightness: str = "unknown"
    texture_variation: str = "unknown"
    color_uniformity: str = "unknown"
    redness: str = "unknown"
    note: str = (
        "Lighting and camera quality significantly affect skin observations. "
        "These are experimental computer-vision measurements, not medical assessments."
    )


class AnalyzeFrameResponse(BaseModel):
    """Real-time analysis result for a single frame."""

    success: bool
    face_detected: bool
    multiple_faces: bool = False
    lighting_quality: Literal["good", "fair", "poor", "unknown"] = "unknown"

    # Indicators
    fatigue_level: Literal["low", "moderate", "elevated", "unknown"] = "unknown"
    stress_level: Literal["low", "moderate", "elevated", "unknown"] = "unknown"
    overall_wellness: Literal["good", "fair", "poor", "unknown"] = "unknown"

    # Raw metrics (for transparency)
    ear_value: Optional[float] = None
    blink_rate: Optional[float] = None
    brow_tension: Optional[float] = None

    skin_observations: Optional[SkinObservations] = None

    # Status / user messaging
    status_message: str = ""
    disclaimer: str = (
        "VitaMirror provides experimental, non-diagnostic wellness observations "
        "based on computer vision. It does not diagnose medical or psychological conditions. "
        "Consult a qualified healthcare professional for medical advice."
    )
    error: Optional[str] = None


# ─────────────────────────────────────────────
# Wellness Check CRUD
# ─────────────────────────────────────────────

class SkinObservationsData(BaseModel):
    brightness: str = "unknown"
    texture_variation: str = "unknown"
    color_uniformity: str = "unknown"
    redness: str = "unknown"


class WellnessCheckCreate(BaseModel):
    fatigue_level: Literal["low", "moderate", "elevated", "unknown"] = "unknown"
    stress_level: Literal["low", "moderate", "elevated", "unknown"] = "unknown"
    overall_wellness: Literal["good", "fair", "poor", "unknown"] = "unknown"
    skin_observations: Optional[dict[str, Any]] = None
    ear_value: Optional[float] = None
    blink_rate: Optional[float] = None
    brow_tension: Optional[float] = None
    skin_brightness: Optional[float] = None
    skin_texture_variance: Optional[float] = None
    skin_redness: Optional[float] = None
    lighting_quality: Optional[str] = None
    face_detected: bool = True
    notes: Optional[str] = None


class WellnessCheckRead(BaseModel):
    id: int
    created_at: datetime
    fatigue_level: str
    stress_level: str
    overall_wellness: str
    skin_observations: Optional[dict[str, Any]] = None
    ear_value: Optional[float] = None
    blink_rate: Optional[float] = None
    brow_tension: Optional[float] = None
    skin_brightness: Optional[float] = None
    skin_texture_variance: Optional[float] = None
    skin_redness: Optional[float] = None
    lighting_quality: Optional[str] = None
    face_detected: bool = True
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class WellnessCheckList(BaseModel):
    checks: list[WellnessCheckRead]
    total: int


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    service: str
