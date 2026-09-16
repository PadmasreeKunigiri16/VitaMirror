"""
Facial landmark analysis – with MediaPipe FaceMesh (preferred)
or OpenCV Haar Cascade fallback (when MediaPipe is unavailable, e.g. Python 3.13).

All indicators are EXPERIMENTAL and NON-DIAGNOSTIC.
"""
from __future__ import annotations
import math
import logging
import numpy as np
import cv2
from typing import Optional

logger = logging.getLogger(__name__)

# ── Try to import MediaPipe (requires Python ≤ 3.12) ──────────────────────────
try:
    import mediapipe as mp
    _MEDIAPIPE_AVAILABLE = True
    logger.info("MediaPipe FaceMesh is available – using full landmark analysis.")
except ImportError:
    _MEDIAPIPE_AVAILABLE = False
    logger.warning(
        "MediaPipe not available (likely Python 3.13+). "
        "Falling back to OpenCV Haar Cascade face/eye detection. "
        "Install Python 3.12 and mediapipe for full landmark analysis."
    )

# ── MediaPipe landmark indices ─────────────────────────────────────────────────
LEFT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
RIGHT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
LEFT_BROW_INDICES = [336, 296, 334, 293, 300]
RIGHT_BROW_INDICES = [107, 66, 105, 63, 70]
MOUTH_TOP = 13
MOUTH_BOTTOM = 14
JAW_LEFT = 234
JAW_RIGHT = 454


def _euclidean(p1, p2) -> float:
    return math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)


def _compute_ear(landmarks, eye_indices: list[int]) -> float:
    pts = [landmarks[i] for i in eye_indices]
    v1 = _euclidean(pts[1], pts[5])
    v2 = _euclidean(pts[2], pts[4])
    h = _euclidean(pts[0], pts[3])
    if h < 1e-6:
        return 0.0
    return (v1 + v2) / (2.0 * h)


def _compute_brow_tension(landmarks) -> float:
    left_inner = landmarks[LEFT_BROW_INDICES[0]]
    right_inner = landmarks[RIGHT_BROW_INDICES[0]]
    return _euclidean(left_inner, right_inner)


def _compute_mouth_openness(landmarks) -> float:
    top = landmarks[MOUTH_TOP]
    bottom = landmarks[MOUTH_BOTTOM]
    left = landmarks[JAW_LEFT]
    right = landmarks[JAW_RIGHT]
    mouth_h = _euclidean(top, bottom)
    face_w = _euclidean(left, right)
    if face_w < 1e-6:
        return 0.0
    return mouth_h / face_w


# ── OpenCV Haar Cascade Fallback ───────────────────────────────────────────────

_haar_face: Optional[cv2.CascadeClassifier] = None
_haar_eye: Optional[cv2.CascadeClassifier] = None


def _get_haar_classifiers():
    global _haar_face, _haar_eye
    if _haar_face is None:
        _haar_face = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
    if _haar_eye is None:
        _haar_eye = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_eye.xml"
        )
    return _haar_face, _haar_eye


def _analyze_haar(bgr_frame: np.ndarray) -> dict:
    """
    Fallback analysis using OpenCV Haar Cascades.

    Detects face + eyes to estimate whether eyes appear open.
    EAR cannot be computed precisely without landmarks,
    so we use a proxy: ratio of detected eye height to face height.

    Returns a dict with the same keys as the MediaPipe path.
    """
    result = {
        "face_detected": False,
        "multiple_faces": False,
        "ear_left": None,
        "ear_right": None,
        "ear_avg": None,
        "brow_tension": None,
        "mouth_openness": None,
        "fatigue_level": "unknown",
        "stress_level": "unknown",
        "norm_brow_tension": None,
        "fallback_mode": True,
    }

    face_cascade, eye_cascade = _get_haar_classifiers()
    gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    if len(faces) == 0:
        return result

    result["face_detected"] = True
    if len(faces) > 1:
        result["multiple_faces"] = True

    # Use the largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi = gray[y : y + h, x : x + w]

    # Detect eyes in the top half of the face
    eyes = eye_cascade.detectMultiScale(
        face_roi[: h // 2, :], scaleFactor=1.1, minNeighbors=3, minSize=(20, 20)
    )

    # Proxy EAR: ratio of eye height to face height
    if len(eyes) > 0:
        avg_eye_h = float(np.mean([ew[3] for ew in eyes]))
        proxy_ear = avg_eye_h / h if h > 0 else 0.25
        # Normalize to typical EAR range (Haar eye height ~10–15% of face)
        # Typical EAR: 0.25–0.35 for open; scale proxy similarly
        ear_est = min(proxy_ear * 2.5, 0.40)
        result["ear_avg"] = round(ear_est, 4)
        result["ear_left"] = result["ear_avg"]
        result["ear_right"] = result["ear_avg"]

        if ear_est < 0.20:
            result["fatigue_level"] = "elevated"
        elif ear_est < 0.27:
            result["fatigue_level"] = "moderate"
        else:
            result["fatigue_level"] = "low"
    else:
        # No eyes detected → possible fatigue signal
        result["fatigue_level"] = "elevated"
        result["ear_avg"] = 0.15

    # Stress: cannot measure brow tension without landmarks → report unknown
    result["stress_level"] = "unknown"
    result["brow_tension"] = None

    return result


# ── MediaPipe Analyzer ─────────────────────────────────────────────────────────

class _MediaPipeAnalyzer:
    def __init__(self):
        self._mp_face_mesh = mp.solutions.face_mesh
        self._face_mesh = self._mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=2,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def analyze(self, rgb_frame: np.ndarray) -> dict:
        result = {
            "face_detected": False,
            "multiple_faces": False,
            "ear_left": None,
            "ear_right": None,
            "ear_avg": None,
            "brow_tension": None,
            "mouth_openness": None,
            "fatigue_level": "unknown",
            "stress_level": "unknown",
            "fallback_mode": False,
        }

        mp_result = self._face_mesh.process(rgb_frame)

        if not mp_result.multi_face_landmarks:
            return result

        result["face_detected"] = True
        if len(mp_result.multi_face_landmarks) > 1:
            result["multiple_faces"] = True

        face_lm = mp_result.multi_face_landmarks[0].landmark

        ear_l = _compute_ear(face_lm, LEFT_EYE_INDICES)
        ear_r = _compute_ear(face_lm, RIGHT_EYE_INDICES)
        ear_avg = (ear_l + ear_r) / 2.0
        brow_tension = _compute_brow_tension(face_lm)
        mouth_openness = _compute_mouth_openness(face_lm)

        result["ear_left"] = round(ear_l, 4)
        result["ear_right"] = round(ear_r, 4)
        result["ear_avg"] = round(ear_avg, 4)
        result["brow_tension"] = round(brow_tension, 4)
        result["mouth_openness"] = round(mouth_openness, 4)

        if ear_avg < 0.20:
            fatigue = "elevated"
        elif ear_avg < 0.27:
            fatigue = "moderate"
        else:
            fatigue = "low"

        if mouth_openness > 0.15 and fatigue == "low":
            fatigue = "moderate"
        elif mouth_openness > 0.20:
            fatigue = "elevated"

        result["fatigue_level"] = fatigue

        jaw_w = _euclidean(face_lm[JAW_LEFT], face_lm[JAW_RIGHT])
        norm_brow_tension = brow_tension / jaw_w if jaw_w > 1e-6 else brow_tension

        if norm_brow_tension < 0.18:
            stress = "elevated"
        elif norm_brow_tension < 0.28:
            stress = "moderate"
        else:
            stress = "low"

        result["stress_level"] = stress
        result["norm_brow_tension"] = round(norm_brow_tension, 4)

        return result

    def close(self):
        self._face_mesh.close()


# ── Public API ─────────────────────────────────────────────────────────────────

_mp_analyzer: Optional[_MediaPipeAnalyzer] = None


class LandmarkAnalyzer:
    """
    Unified facade for landmark / face analysis.
    Uses MediaPipe FaceMesh when available, falls back to Haar Cascades.
    """

    def analyze(self, rgb_frame: np.ndarray) -> dict:
        if _MEDIAPIPE_AVAILABLE:
            global _mp_analyzer
            if _mp_analyzer is None:
                _mp_analyzer = _MediaPipeAnalyzer()
            return _mp_analyzer.analyze(rgb_frame)
        else:
            # Convert RGB → BGR for OpenCV Haar
            bgr = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2BGR)
            return _analyze_haar(bgr)

    def close(self):
        global _mp_analyzer
        if _mp_analyzer is not None:
            _mp_analyzer.close()
            _mp_analyzer = None
