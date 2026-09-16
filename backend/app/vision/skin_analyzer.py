"""
Skin appearance analysis from the face ROI.

Observations computed:
- Brightness (mean luminance of face region)
- Texture variation (Laplacian variance as texture roughness proxy)
- Color uniformity (coefficient of variation of RGB channels)
- Redness (R/G ratio in skin region)

IMPORTANT: These are experimental computer-vision observations.
They are NOT medical assessments of skin health or disease.
Lighting and camera quality significantly affect all readings.
"""
from __future__ import annotations
import numpy as np
import cv2
from typing import Optional


def _label_brightness(value: float) -> str:
    if value < 60:
        return "low"
    elif value < 130:
        return "moderate"
    elif value < 200:
        return "normal"
    else:
        return "high"


def _label_texture(value: float) -> str:
    """Laplacian variance → texture variation label."""
    if value < 30:
        return "smooth"
    elif value < 100:
        return "moderate"
    else:
        return "high"


def _label_uniformity(cv: float) -> str:
    """Coefficient of variation → uniformity label."""
    if cv < 0.10:
        return "high"
    elif cv < 0.20:
        return "moderate"
    else:
        return "low"


def _label_redness(ratio: float) -> str:
    """R/G ratio → redness label."""
    if ratio < 1.10:
        return "low"
    elif ratio < 1.25:
        return "moderate"
    else:
        return "elevated"


def analyze_skin(bgr_frame: np.ndarray, face_box: Optional[tuple] = None) -> dict:
    """
    Analyze visible skin characteristics from the face region.

    Args:
        bgr_frame: Full BGR frame from OpenCV.
        face_box: Optional (x, y, w, h) crop for the face region.
                  If None, uses the center 40% of the frame as a proxy.

    Returns:
        dict with brightness, texture_variation, color_uniformity,
        redness (labels + raw values).
    """
    h, w = bgr_frame.shape[:2]

    # Crop to face region if provided, else use center crop
    if face_box is not None:
        x, y, fw, fh = face_box
        roi = bgr_frame[y : y + fh, x : x + fw]
    else:
        # Center 40% × 40% crop as rough face proxy
        cy, cx = h // 2, w // 2
        half_h, half_w = int(h * 0.2), int(w * 0.2)
        roi = bgr_frame[cy - half_h : cy + half_h, cx - half_w : cx + half_w]

    if roi.size == 0:
        roi = bgr_frame  # fallback to full frame

    # ── Brightness ──
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))

    # ── Texture variation (Laplacian variance) ──
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    texture_var = float(np.var(lap))

    # ── Color uniformity (coefficient of variation across RGB channels) ──
    roi_f = roi.astype(np.float32)
    channel_means = roi_f.reshape(-1, 3).mean(axis=0)
    channel_stds = roi_f.reshape(-1, 3).std(axis=0)
    overall_cv = float(np.mean(channel_stds / (channel_means + 1e-6)))

    # ── Redness (R/G ratio) ──
    r_mean = float(roi_f[:, :, 2].mean())  # BGR → R is index 2
    g_mean = float(roi_f[:, :, 1].mean())
    rg_ratio = r_mean / (g_mean + 1e-6)

    return {
        # Raw values
        "brightness_raw": round(brightness, 2),
        "texture_var_raw": round(texture_var, 2),
        "color_uniformity_cv": round(overall_cv, 4),
        "redness_ratio": round(rg_ratio, 4),
        # Labels
        "brightness": _label_brightness(brightness),
        "texture_variation": _label_texture(texture_var),
        "color_uniformity": _label_uniformity(overall_cv),
        "redness": _label_redness(rg_ratio),
        "note": (
            "Skin observations are experimental computer-vision measurements. "
            "Lighting and camera quality significantly affect these readings. "
            "This is NOT a medical assessment."
        ),
    }
