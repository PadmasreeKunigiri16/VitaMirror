"""
OpenCV frame preprocessing utilities.

Responsibilities:
- Decode base64 image data to numpy array
- Resize to analysis-friendly dimensions
- Assess lighting quality
- Convert color spaces as needed
"""
from __future__ import annotations
import base64
import numpy as np
import cv2
from typing import Tuple


TARGET_WIDTH = 640   # Resize frames to this width for consistent processing
TARGET_HEIGHT = 480


def decode_base64_frame(frame_b64: str) -> np.ndarray:
    """Decode a base64-encoded JPEG/PNG into a BGR numpy array."""
    # Strip data-URI prefix if present
    if "," in frame_b64:
        frame_b64 = frame_b64.split(",", 1)[1]

    img_bytes = base64.b64decode(frame_b64)
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image data – ensure valid JPEG/PNG is provided.")
    return img


def resize_frame(frame: np.ndarray) -> np.ndarray:
    """Resize frame to TARGET_WIDTH × TARGET_HEIGHT preserving aspect ratio."""
    h, w = frame.shape[:2]
    scale = min(TARGET_WIDTH / w, TARGET_HEIGHT / h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized


def assess_lighting(frame: np.ndarray) -> Tuple[str, float]:
    """
    Evaluate lighting quality from mean luminance of the V channel (HSV).

    Returns:
        (quality_label, mean_luminance)
        quality_label: "good" | "fair" | "poor"
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    mean_lum = float(np.mean(v_channel))

    if mean_lum < 50:
        quality = "poor"
    elif mean_lum < 100:
        quality = "fair"
    else:
        quality = "good"

    return quality, mean_lum


def to_rgb(frame: np.ndarray) -> np.ndarray:
    """Convert BGR (OpenCV default) to RGB (MediaPipe / PIL compatible)."""
    return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
