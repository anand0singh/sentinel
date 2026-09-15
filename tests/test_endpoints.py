"""
Tests for Phase 3 Endpoint Fleet Matrix & eBPF Telemetry
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_list_endpoints():
    response = client.get("/api/v1/endpoints")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data
    assert data["fleet_total"] >= 5


def test_endpoint_probe_stream():
    response = client.get("/api/v1/endpoints/ep-lin-01/probes")
    assert response.status_code == 200
    data = response.json()
    assert data["endpoint_id"] == "ep-lin-01"
    assert len(data["events"]) > 0
    assert "sys_enter_execve" in [e["probe"] for e in data["events"]]


def test_endpoint_remediation_action():
    payload = {
        "action": "isolate",
        "reason": "Host compromised by active meterpreter session"
    }
    response = client.post("/api/v1/endpoints/ep-lin-01/action", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["action"] == "isolate"
