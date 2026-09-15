"""
Tests for Expanded Attack Vectors (Ransomware & DNS Tunneling)
"""
from cyber_range.attacks.ransomware import RansomwareSimulator
from cyber_range.attacks.dns_tunneling import DNSTunnelingSimulator
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_ransomware_simulator():
    sim = RansomwareSimulator(target_host="10.0.3.104")
    events = sim.generate_events(file_count=5)
    assert len(events) == 5
    assert events[0]["mitre_technique"] == "T1486"
    assert "sentinel_locked" in events[0]["file"]["path"]


def test_dns_tunneling_simulator():
    sim = DNSTunnelingSimulator(source_ip="10.0.0.50", rogue_ns="198.51.100.44")
    events = sim.generate_events(query_count=4)
    assert len(events) == 4
    assert events[0]["mitre_technique"] == "T1071.004"
    assert "covert-c2-sentinel.net" in events[0]["dns"]["question"]["name"]


def test_simulate_ransomware_via_api():
    payload = {
        "scenario": "ransomware",
        "target_ip": "10.0.3.104",
        "attacker_ip": "198.51.100.44"
    }
    response = client.post("/api/v1/range/simulate", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ACCEPTED"


def test_simulate_dns_tunneling_via_api():
    payload = {
        "scenario": "dns_tunneling",
        "target_ip": "10.0.0.50",
        "attacker_ip": "198.51.100.44"
    }
    response = client.post("/api/v1/range/simulate", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ACCEPTED"
