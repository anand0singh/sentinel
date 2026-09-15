"""
Tests for Phase 3 Deception Technology & Honey-Token Canary Mesh
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_get_canary_tokens():
    response = client.get("/api/v1/canary/tokens")
    assert response.status_code == 200
    data = response.json()
    assert "tokens" in data
    assert data["total_tokens"] >= 4


def test_deploy_canary():
    payload = {
        "name": "DECOY-KUBE-SECRET",
        "token_type": "cloud_token",
        "location": "/etc/kubernetes/admin.conf",
        "payload_value": "FakeKubeToken2026",
    }
    response = client.post("/api/v1/canary/deploy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DECOY-KUBE-SECRET"
    assert data["status"] == "ARMED"


def test_trigger_canary():
    payload = {
        "token_id": "canary-aws-01",
        "intruder_ip": "10.0.3.104"
    }
    response = client.post("/api/v1/canary/trigger", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["token_id"] == "canary-aws-01"
    assert data["false_positive_probability"] == 0.0
    assert data["auto_containment_triggered"] is True
