"""
Cyber Range Attack: DNS Tunneling Exfiltration Simulator (T1071.004)
Simulates data exfiltration and covert C2 beaconing using base64 encoded TXT/A records.
"""
from typing import Dict, Any, List
from datetime import datetime
import base64


class DNSTunnelingSimulator:
    def __init__(self, source_ip: str = "192.168.1.100", rogue_ns: str = "198.51.100.44"):
        self.source_ip = source_ip
        self.rogue_ns = rogue_ns

    def generate_events(self, query_count: int = 8) -> List[Dict[str, Any]]:
        events = []
        payload_chunks = [
            "dXNlcj1hZG1pbjtwYXNzPVN1cDNyUzNjcjN0",
            "a2V5PVNIQTI1Nl9QUklWQVRFX0NFUlRfUk9PVA==",
            "ZGF0YT1leGZpbHRyYXRlZF9jdXN0b21lcl9kYXRh",
            "c3FsX2R1bXA9c2VsZWN0ICogZnJvbSBjcmVkaXRfY2FyZHM=",
        ]

        for i in range(query_count):
            chunk = payload_chunks[i % len(payload_chunks)]
            tunnel_domain = f"{chunk}.ns1.covert-c2-sentinel.net"

            event = {
                "@timestamp": datetime.utcnow().isoformat() + "Z",
                "event": {"category": ["network"], "type": ["dns", "tunneling"]},
                "source": {"ip": self.source_ip, "port": 51420 + i},
                "destination": {"ip": self.rogue_ns, "port": 53},
                "dns": {
                    "question": {"name": tunnel_domain, "type": "TXT"},
                    "resolved_ip": self.rogue_ns,
                    "subdomain_length": len(chunk),
                    "subdomain_entropy": 4.82,
                },
                "mitre_technique": "T1071.004",
                "attack_chain_stage": "EXFILTRATION",
                "description": f"Covert DNS Tunneling Query: {tunnel_domain} (High Subdomain Entropy)",
            }
            events.append(event)

        return events
