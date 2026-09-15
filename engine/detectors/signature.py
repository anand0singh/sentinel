"""
Signature & Rule-Based Detection Engine
Evaluates network alerts and endpoint telemetry against MITRE ATT&CK taxonomy.
"""
import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("Sentinel-SignatureDetector")

SUSPICIOUS_COMMANDS = [
    (r"(?:nc|netcat)\s+.*-e\s+/bin/(?:ba)?sh", "T1059.004", "Command and Scripting Interpreter: Unix Shell", "CRITICAL"),
    (r"/bin/(?:ba)?sh\s+-i\s+>&\s+/dev/tcp/", "T1059.004", "Reverse Shell Spawning via /dev/tcp", "CRITICAL"),
    (r"powershell.*-(?:enc|encodedcommand)\s+[A-Za-z0-9+/=]+", "T1059.001", "PowerShell Encoded Command", "HIGH"),
    (r"curl\s+.*\|\s*(?:bash|sh)", "T1059.004", "Remote Script Download and Execution", "HIGH"),
    (r"nmap\s+-[sS|sT|sU|sV]", "T1046", "Network Service Scanning", "MEDIUM"),
    (r"cat\s+/etc/shadow", "T1003.008", "Credential Access via /etc/shadow", "HIGH"),
]


class SignatureEngine:
    def __init__(self):
        self.compiled_rules = [
            (re.compile(pattern, re.IGNORECASE), tactic_id, desc, sev)
            for pattern, tactic_id, desc, sev in SUSPICIOUS_COMMANDS
        ]

    def evaluate_endpoint(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        cmd = event.get("process_command_line") or event.get("process_name", "")
        if not cmd:
            return None

        for pattern, tech_id, desc, severity in self.compiled_rules:
            if pattern.search(cmd):
                return {
                    "title": f"Malicious Process Execution: {desc}",
                    "severity": severity,
                    "mitre_tactic": "Execution",
                    "mitre_technique": tech_id,
                    "source_ip": event.get("source_ip", "127.0.0.1"),
                    "destination_ip": event.get("destination_ip", "0.0.0.0"),
                    "process_name": event.get("process_name", "unknown"),
                    "attack_chain_stage": "EXPLOITATION",
                    "confidence": 0.95,
                    "description": f"Matched signature '{pattern.pattern}' in command: {cmd}",
                    "forensic_payload": str(event),
                }
        return None

    def evaluate_network(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        sig = event.get("signature", "")
        if not sig and event.get("threat_matched", 0) == 0:
            return None

        title = sig or f"Threat Intelligence Hit: {event.get('destination_ip')}"
        severity = "HIGH" if event.get("threat_score", 0) > 75 else "MEDIUM"
        
        # Tag MITRE Tactic
        tactic = "Initial Access"
        technique = "T1190"
        if "scan" in title.lower() or "probe" in title.lower():
            tactic = "Discovery"
            technique = "T1046"
        elif "c2" in title.lower() or "beacon" in title.lower():
            tactic = "Command and Control"
            technique = "T1071"

        return {
            "title": f"Network Alert: {title}",
            "severity": severity,
            "mitre_tactic": tactic,
            "mitre_technique": technique,
            "source_ip": event.get("source_ip", "0.0.0.0"),
            "destination_ip": event.get("destination_ip", "0.0.0.0"),
            "process_name": event.get("process_name", "network-stack"),
            "attack_chain_stage": "RECON" if tactic == "Discovery" else "C2",
            "confidence": 0.90,
            "description": f"Network detection triggered: {title}",
            "forensic_payload": str(event),
        }
