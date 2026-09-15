"""
Tests for Real-Time Telemetry & System Vitals Router
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_get_telemetry_vitals():
    response = client.get("/api/v1/telemetry/vitals")
    assert response.status_code == 200
    data = response.json()
    assert "cpu_percent" in data
    assert "ingestion_eps" in data
    assert "memory_used_gb" in data
    assert "sensors" in data
    assert len(data["sensors"]) >= 5
    assert data["network_status"] == "SECURE"
