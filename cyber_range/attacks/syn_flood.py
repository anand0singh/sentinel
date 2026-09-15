"""
Cyber Range Attack Module: SYN Flood Simulator
Generates high-volume TCP SYN packets with randomized source IPs.
"""
import random
import logging
from typing import Dict, Any

logger = logging.getLogger("Sentinel-Range-SYNFlood")


class SYNFloodSimulator:
    def __init__(self, target_ip: str = "192.168.1.50", target_port: int = 80, count: int = 50):
        self.target_ip = target_ip
        self.target_port = target_port
        self.count = count

    def generate_events(self):
        """Generates synthetic network telemetry representing a SYN flood attack."""
        events = []
        for _ in range(self.count):
            spoofed_ip = f"{random.randint(11, 200)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            events.append({
                "timestamp": None,
                "src_ip": spoofed_ip,
                "src_port": random.randint(1024, 65535),
                "dest_ip": self.target_ip,
                "dest_port": self.target_port,
                "proto": "TCP",
                "alert": {
                    "signature": "ET DOS Possible SYN Flood Inbound",
                    "signature_id": 2001001,
                    "severity": 2
                }
            })
        return events


if __name__ == "__main__":
    sim = SYNFloodSimulator()
    print(f"Generated {len(sim.generate_events())} SYN flood test packets.")
