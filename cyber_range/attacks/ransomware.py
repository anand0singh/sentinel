"""
Cyber Range Attack: Ransomware Encryption Simulator (T1486)
Simulates high-velocity file rename, extension mutation (.locked), and honey-file touches.
"""
from typing import Dict, Any, List
from datetime import datetime
import time


class RansomwareSimulator:
    def __init__(self, target_host: str = "192.168.1.100", process_name: str = "vssadmin.exe"):
        self.target_host = target_host
        self.process_name = process_name

    def generate_events(self, file_count: int = 12) -> List[Dict[str, Any]]:
        events = []
        files = [
            "C:\\Users\\Finance\\Q3_Revenue.xlsx",
            "C:\\Users\\Finance\\Payroll_2026.csv",
            "C:\\Users\\Public\\Bait_Salary.xlsx",  # Trip canary file
            "C:\\Database\\backup_primary.sql",
            "C:\\Shares\\Corporate\\Contracts.docx",
        ]

        for i in range(file_count):
            target_f = files[i % len(files)]
            encrypted_f = f"{target_f}.sentinel_locked"
            event = {
                "@timestamp": datetime.utcnow().isoformat() + "Z",
                "event": {"category": ["process", "file"], "type": ["change", "deletion"]},
                "host": {"ip": self.target_host, "hostname": "ENG-WORKSTATION-04"},
                "process": {
                    "name": self.process_name,
                    "pid": 7104,
                    "command_line": f"{self.process_name} delete shadows /all /quiet",
                },
                "file": {
                    "path": encrypted_f,
                    "original_path": target_f,
                    "entropy": 7.94,  # High entropy indicating encrypted payload
                    "extension": "sentinel_locked",
                },
                "mitre_technique": "T1486",
                "attack_chain_stage": "IMPACT",
                "description": f"Ransomware encryption burst detected: {target_f} -> {encrypted_f} (Entropy: 7.94)",
            }
            events.append(event)

        return events
