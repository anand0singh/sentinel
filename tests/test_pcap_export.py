"""
Tests for Deep Packet Forensic PCAP Binary Export
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_export_pcap_capture():
    response = client.get("/api/v1/forensics/packets/export/pcap")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.tcpdump.pcap"
    assert "attachment; filename=" in response.headers.get("content-disposition", "")
    assert len(response.content) > 24  # Standard PCAP header is at least 24 bytes
