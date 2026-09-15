"""
Tests for Phase 3 AI SOC Co-Pilot & Threat Hunter
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_copilot_analyze():
    payload = {
        "title": "Cobalt Strike C2 Beacon Activity",
        "src_ip": "10.0.0.50",
        "dst_ip": "198.51.100.42",
        "severity": "CRITICAL"
    }
    response = client.post("/api/v1/copilot/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert "executive_narrative" in data
    assert "containment_scripts" in data
    assert "bash" in data["containment_scripts"]
    assert "powershell" in data["containment_scripts"]


def test_copilot_threat_hunt():
    payload = {
        "query": "Show outbound connection to port 4444"
    }
    response = client.post("/api/v1/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "findings" in data
    assert data["matches_found"] > 0
    assert "records_scanned" in data


def test_copilot_incident_reports():
    response = client.get("/api/v1/copilot/reports")
    assert response.status_code == 200
    data = response.json()
    assert "reports" in data
    assert len(data["reports"]) >= 1
