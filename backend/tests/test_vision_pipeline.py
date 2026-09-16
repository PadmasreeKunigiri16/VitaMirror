"""
Tests for the CV pipeline and analysis endpoint.

The analyze endpoint requires a valid base64 image.
We generate a synthetic test frame using numpy/OpenCV.
"""
import base64
import numpy as np
import cv2
import pytest


def make_test_frame_b64(width: int = 320, height: int = 240) -> str:
    """Generate a simple synthetic BGR frame and base64-encode it as JPEG."""
    # Create a realistic-ish skin-tone colored frame
    frame = np.zeros((height, width, 3), dtype=np.uint8)
    frame[:, :] = (110, 150, 200)  # BGR approximation of skin tone

    # Add an oval face-like region
    cv2.ellipse(
        frame,
        (width // 2, height // 2),
        (width // 4, height // 3),
        0, 0, 360,
        (120, 165, 210), -1
    )

    _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return base64.b64encode(buf.tobytes()).decode("utf-8")


def test_analyze_with_valid_frame(client):
    """
    A valid frame should return 200 with the expected response structure.
    Face may or may not be detected on a synthetic frame – that's fine.
    """
    b64 = make_test_frame_b64()
    payload = {"frame_data": b64}
    response = client.post("/api/wellness/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "face_detected" in data
    assert "lighting_quality" in data
    assert "disclaimer" in data
    assert "VitaMirror" in data["disclaimer"]


def test_analyze_with_data_uri_prefix(client):
    """Frame with data URI prefix should be handled correctly."""
    b64 = make_test_frame_b64()
    payload = {"frame_data": f"data:image/jpeg;base64,{b64}"}
    response = client.post("/api/wellness/analyze", json=payload)
    assert response.status_code == 200


def test_analyze_invalid_base64(client):
    """Garbage base64 should return 422 or 200 with error."""
    payload = {"frame_data": "NOT_VALID_BASE64!!!"}
    response = client.post("/api/wellness/analyze", json=payload)
    # Either 422 (Pydantic) or 200 with error in body
    assert response.status_code in (200, 422)


def test_analyze_oversized_frame(client):
    """Frame exceeding 5 MB should return 422."""
    big = "A" * (6 * 1024 * 1024)  # ~6 MB of ASCII (base64 decoded)
    # Re-encode to ensure it looks like valid base64
    payload = {"frame_data": base64.b64encode(b"x" * (6 * 1024 * 1024)).decode()}
    response = client.post("/api/wellness/analyze", json=payload)
    assert response.status_code == 422


def test_analyze_returns_disclaimer(client):
    """Response must always include the non-diagnostic disclaimer."""
    b64 = make_test_frame_b64()
    response = client.post("/api/wellness/analyze", json={"frame_data": b64})
    data = response.json()
    assert "disclaimer" in data
    assert len(data["disclaimer"]) > 50
