import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from api.main import app
from engine.response.playbooks import soar_playbook_engine

client = TestClient(app)

def test_playbooks_api():
    # 1. List playbooks
    res = client.get("/api/v1/playbooks/")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 4
    
    # 2. Toggle playbook
    toggle_res = client.patch("/api/v1/playbooks/PB-01/toggle", json={"enabled": False})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["playbook"]["enabled"] is False

    # Restore
    client.patch("/api/v1/playbooks/PB-01/toggle", json={"enabled": True})

def test_rollback_action():
    # Execute rollback on existing action
    res = client.post("/api/v1/playbooks/rollback/ACT-901")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "192.168.1.100" in data["target"]

def test_rollback_immutable():
    # PID kill should be rejected for rollback
    res = client.post("/api/v1/playbooks/rollback/ACT-903")
    assert res.status_code == 400
