"""
Cyber Range Attack Module: Data Exfiltration Simulator
Simulates bulk, high-volume egress anomalies (DNS / HTTPS exfiltration).
"""
from typing import Dict, Any


class DataExfilSimulator:
    def __init__(self, source_ip: str = "192.168.1.50", destination_ip: str = "203.0.113.88"):
        self.source_ip = source_ip
        self.destination_ip = destination_ip

    def generate_exfil_event(self) -> Dict[str, Any]:
        return {
            "timestamp": None,
            "src_ip": self.source_ip,
            "src_port": 51200,
            "dest_ip": self.destination_ip,
            "dest_port": 443,
            "proto": "TCP",
            "bytes_out": 95_000_000,  # 95 MB egress anomaly
            "bytes_in": 1200,
            "duration": 45.0,
            "packet_count": 68000,
            "alert": {
                "signature": "ET POLICY Suspicious Large Outbound Data Transfer",
                "signature_id": 2003003,
                "severity": 1,
            },
        }
