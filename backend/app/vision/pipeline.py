"""
VitaMirror Computer Vision Pipeline – Orchestrator.

Works with:
- MediaPipe FaceMesh (Python ≤ 3.12): full 468-landmark analysis
- OpenCV Haar Cascades (Python 3.13+): EAR proxy, no stress indicator

All indicators are EXPERIMENTAL and NON-DIAGNOSTIC.
"""
from __future__ import annotations
import logging
from app.vision.preprocessor import decode_base64_frame, resize_frame, assess_lighting, to_rgb
from app.vision.landmark_analyzer import LandmarkAnalyzer
from app.vision.skin_analyzer import analyze_skin

logger = logging.getLogger(__name__)

_analyzer: LandmarkAnalyzer | None = None


def _get_analyzer() -> LandmarkAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = LandmarkAnalyzer()
    return _analyzer


def _compute_overall_wellness(fatigue: str, stress: str, lighting: str) -> str:
    if lighting == "poor":
        return "fair"
    if fatigue == "elevated" or stress == "elevated":
        return "poor"
    if fatigue == "moderate" or stress == "moderate":
        return "fair"
    if fatigue == "low" and stress in ("low", "unknown"):
        return "good"
    if fatigue == "low" and stress == "unknown":
        return "good"
    return "unknown"


def run_pipeline(frame_b64: str) -> dict:
    """
    Run full CV pipeline on a single base64-encoded frame.
    Returns dict compatible with AnalyzeFrameResponse schema.
    """
    result = {
        "success": False,
        "face_detected": False,
        "multiple_faces": False,
        "lighting_quality": "unknown",
        "fatigue_level": "unknown",
        "stress_level": "unknown",
        "overall_wellness": "unknown",
        "ear_value": None,
        "blink_rate": None,
        "brow_tension": None,
        "skin_observations": None,
        "status_message": "",
        "error": None,
    }

    try:
        # Step 1: Decode
        bgr = decode_base64_frame(frame_b64)

        # Step 2: Resize
        bgr = resize_frame(bgr)

        # Step 3: Lighting
        lighting_quality, mean_lum = assess_lighting(bgr)
        result["lighting_quality"] = lighting_quality

        if lighting_quality == "poor":
            result["status_message"] = (
                "Poor lighting detected. Please move to a brighter area for best results."
            )

        # Step 4: Landmark / face analysis
        rgb = to_rgb(bgr)
        analyzer = _get_analyzer()
        lm_result = analyzer.analyze(rgb)

        result["face_detected"] = lm_result["face_detected"]
        result["multiple_faces"] = lm_result.get("multiple_faces", False)

        if not lm_result["face_detected"]:
            result["status_message"] = "No face detected. Please position your face in the camera view."
            result["success"] = True
            return result

        if lm_result["multiple_faces"]:
            result["status_message"] = "Multiple faces detected. Please ensure only one face is visible."

        result["ear_value"] = lm_result.get("ear_avg")
        result["brow_tension"] = lm_result.get("norm_brow_tension")
        result["fatigue_level"] = lm_result["fatigue_level"]
        result["stress_level"] = lm_result["stress_level"]

        # Add note if running in fallback mode
        fallback = lm_result.get("fallback_mode", False)
        if fallback:
            logger.debug("Haar fallback mode active – stress indicator unavailable.")

        # Step 5: Skin analysis
        skin = analyze_skin(bgr)
        result["skin_observations"] = {
            "brightness": skin["brightness"],
            "texture_variation": skin["texture_variation"],
            "color_uniformity": skin["color_uniformity"],
            "redness": skin["redness"],
            "note": skin["note"],
        }

        # Step 6: Overall wellness
        result["overall_wellness"] = _compute_overall_wellness(
            result["fatigue_level"],
            result["stress_level"],
            lighting_quality,
        )

        # Step 7: Status message
        if not result["status_message"]:
            result["status_message"] = "Analysis complete"

        result["success"] = True

    except ValueError as e:
        logger.warning("Pipeline value error: %s", e)
        result["error"] = str(e)
        result["status_message"] = "Could not process frame – please try again."
    except Exception as e:
        logger.exception("Unexpected pipeline error")
        result["error"] = "Internal analysis error. Please try again."
        result["status_message"] = "Analysis failed."

    return result
