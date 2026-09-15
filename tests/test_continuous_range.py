"""
Tests for Continuous Red-Team Cyber Range Runner
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_continuous_range_status():
    response = client.get("/api/v1/range/continuous/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "interval_sec" in data
    assert "total_iterations" in data


def test_continuous_range_toggle():
    # Toggle on
    response = client.post("/api/v1/range/continuous/toggle")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

    # Toggle off
    response2 = client.post("/api/v1/range/continuous/toggle")
    assert response2.status_code == 200
