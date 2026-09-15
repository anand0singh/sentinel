import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from api.main import app

client = TestClient(app)

def test_list_packets():
    res = client.get("/api/v1/forensics/packets")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 3
    assert len(data["packets"]) >= 3
    first = data["packets"][0]
    assert "community_id" in first
    assert "hex_dump" in first
    assert "dissection" in first

def test_get_packet_details():
    res = client.get("/api/v1/forensics/packets/PKT-1001")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "PKT-1001"
    assert "ethernet" in data["dissection"]
    assert "tcp" in data["dissection"]
    assert len(data["hex_dump"]) > 0
