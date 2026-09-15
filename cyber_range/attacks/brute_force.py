"""
Cyber Range Attack Module: Brute Force Simulator
Simulates high-frequency SSH/FTP authentication failures.
"""
import random
from typing import List, Dict, Any


class BruteForceSimulator:
    def __init__(self, target_ip: str = "192.168.1.50", attacker_ip: str = "185.220.101.5"):
        self.target_ip = target_ip
        self.attacker_ip = attacker_ip

    def generate_events(self, attempts: int = 15) -> List[Dict[str, Any]]:
        events = []
        usernames = ["root", "admin", "ubuntu", "test", "oracle", "postgres"]
        for i in range(attempts):
            user = random.choice(usernames)
            events.append({
                "timestamp": None,
                "src_ip": self.attacker_ip,
                "src_port": random.randint(30000, 60000),
                "dest_ip": self.target_ip,
                "dest_port": 22,
                "proto": "TCP",
                "alert": {
                    "signature": f"ET SCAN Potential SSH Brute Force Attempt (User: {user})",
                    "signature_id": 2002002,
                    "severity": 3
                }
            })
        return events
