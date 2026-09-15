import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from api.main import app

client = TestClient(app)

def test_list_scenarios():
    response = client.get("/api/v1/range/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) >= 6
    scenario_ids = [s["id"] for s in data["scenarios"]]
    assert "full_killchain" in scenario_ids
    assert "c2_beacon" in scenario_ids
    assert "rev_shell" in scenario_ids

def test_trigger_simulation():
    payload = {
        "scenario": "c2_beacon",
        "target_ip": "192.168.1.100",
        "attacker_ip": "198.51.100.44",
    }
    response = client.post("/api/v1/range/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ACCEPTED"
    assert data["scenario"] == "c2_beacon"

def test_invalid_scenario():
    response = client.post("/api/v1/range/simulate", json={"scenario": "invalid_exploit"})
    assert response.status_code == 400
