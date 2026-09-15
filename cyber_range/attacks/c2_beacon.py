"""
Cyber Range Attack Module: C2 Beacon Simulator
Generates periodic, low-jitter network connections mimicking malware callbacks.
"""
import time
from typing import List, Dict, Any


class C2BeaconSimulator:
    def __init__(self, infected_host: str = "192.168.1.50", c2_server: str = "198.51.100.44", interval_sec: float = 2.0):
        self.infected_host = infected_host
        self.c2_server = c2_server
        self.interval_sec = interval_sec

    def generate_beacon_stream(self, count: int = 12) -> List[Dict[str, Any]]:
        events = []
        base_time = time.time() - (count * self.interval_sec)
        for i in range(count):
            t = base_time + (i * self.interval_sec)
            events.append({
                "timestamp": t,
                "src_ip": self.infected_host,
                "src_port": 49152 + i,
                "dest_ip": self.c2_server,
                "dest_port": 443,
                "proto": "TCP",
                "bytes_out": 256,
                "bytes_in": 128,
            })
        return events
