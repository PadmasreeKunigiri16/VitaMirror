"""
Tests for wellness check CRUD endpoints.

POST /api/wellness/checks
GET  /api/wellness/checks
GET  /api/wellness/checks/{id}
DELETE /api/wellness/checks/{id}
"""
import pytest


SAMPLE_CHECK = {
    "fatigue_level": "low",
    "stress_level": "moderate",
    "overall_wellness": "fair",
    "skin_observations": {
        "brightness": "normal",
        "texture_variation": "moderate",
        "color_uniformity": "high",
        "redness": "low",
    },
    "ear_value": 0.28,
    "blink_rate": None,
    "brow_tension": 0.22,
    "skin_brightness": 145.5,
    "skin_texture_variance": 60.2,
    "skin_redness": 1.15,
    "lighting_quality": "good",
    "face_detected": True,
    "notes": "Test check",
}


def test_save_check_returns_201(client):
    response = client.post("/api/wellness/checks", json=SAMPLE_CHECK)
    assert response.status_code == 201
    data = response.json()
    assert data["fatigue_level"] == "low"
    assert data["stress_level"] == "moderate"
    assert "id" in data
    assert "created_at" in data


def test_list_checks_returns_200(client):
    response = client.get("/api/wellness/checks")
    assert response.status_code == 200
    data = response.json()
    assert "checks" in data
    assert "total" in data
    assert isinstance(data["checks"], list)


def test_get_check_by_id(client):
    # Create first
    create_resp = client.post("/api/wellness/checks", json=SAMPLE_CHECK)
    check_id = create_resp.json()["id"]

    # Retrieve
    response = client.get(f"/api/wellness/checks/{check_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == check_id
    assert data["fatigue_level"] == "low"


def test_get_nonexistent_check_returns_404(client):
    response = client.get("/api/wellness/checks/999999")
    assert response.status_code == 404


def test_delete_check(client):
    # Create
    create_resp = client.post("/api/wellness/checks", json=SAMPLE_CHECK)
    check_id = create_resp.json()["id"]

    # Delete
    del_resp = client.delete(f"/api/wellness/checks/{check_id}")
    assert del_resp.status_code == 204

    # Verify gone
    get_resp = client.get(f"/api/wellness/checks/{check_id}")
    assert get_resp.status_code == 404


def test_delete_nonexistent_check_returns_404(client):
    response = client.delete("/api/wellness/checks/999999")
    assert response.status_code == 404


def test_save_check_invalid_level(client):
    """Invalid enum value should return 422."""
    bad = {**SAMPLE_CHECK, "fatigue_level": "extremely_high"}
    response = client.post("/api/wellness/checks", json=bad)
    assert response.status_code == 422


def test_list_checks_limit(client):
    """Limit >100 should be capped to 100."""
    response = client.get("/api/wellness/checks?limit=200")
    assert response.status_code == 200
