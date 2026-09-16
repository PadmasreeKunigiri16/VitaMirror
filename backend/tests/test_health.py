"""Tests for GET /api/health endpoint."""


def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "service" in data


def test_health_service_name(client):
    response = client.get("/api/health")
    data = response.json()
    assert "VitaMirror" in data["service"]


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data
