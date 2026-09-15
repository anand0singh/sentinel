import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from api.main import app

client = TestClient(app)

def test_intel_stats():
    res = client.get("/api/v1/intel/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["capacity"] == 1000000
    assert data["total_iocs"] >= 5
    assert "bitset_density_pct" in data

def test_intel_lookup_malicious():
    res = client.post("/api/v1/intel/lookup", json={"ioc": "198.51.100.44"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "MALICIOUS"
    assert data["threat_score"] >= 90.0

def test_intel_lookup_clean():
    res = client.post("/api/v1/intel/lookup", json={"ioc": "8.8.8.8"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CLEAN"
    assert data["threat_score"] == 0.0

def test_intel_sync():
    res = client.post("/api/v1/intel/sync", json={"feed_name": "AlienVault OTX"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["iocs_added"] >= 1
