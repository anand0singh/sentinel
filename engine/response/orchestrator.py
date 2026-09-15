"""
SOAR Response Orchestrator
Evaluates high-severity alerts and triggers policy-based automated containment.
"""
import os
import logging
from typing import Dict, Any, Optional
from engine.response.actions import ContainmentActions

logger = logging.getLogger("Sentinel-SOAR-Orchestrator")


class ResponseOrchestrator:
    def __init__(self):
        self.auto_containment = os.getenv("SOAR_AUTO_CONTAINMENT_ENABLED", "true").lower() in ("true", "1")

    def handle_alert(self, alert: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Evaluates incoming alert and executes automated containment if policy matches."""
        severity = alert.get("severity", "LOW")
        technique = alert.get("mitre_technique", "")
        target_ip = alert.get("source_ip", "")
        pid = alert.get("process_pid", 0)

        # Policy 1: Critical Attack Chain Root Detection -> Host & IP Quarantine
        if technique == "ATTACK-CHAIN-DETECTED" and self.auto_containment:
            logger.warning(f"SOAR Triggered: Host isolation on {alert.get('destination_ip')}")
            res = ContainmentActions.isolate_host(alert.get("destination_ip", ""))
            ContainmentActions.block_ip(alert.get("source_ip", ""))
            return res

        # Policy 2: Exploitation / Reverse Shell -> Process Termination
        if severity == "CRITICAL" and pid > 0 and self.auto_containment:
            logger.warning(f"SOAR Triggered: Process termination for PID {pid}")
            return ContainmentActions.kill_process(pid, alert.get("process_name", ""))

        # Policy 3: High-Confidence C2 Beaconing / External Scanner -> Perimeter Block
        if severity in ("CRITICAL", "HIGH") and target_ip and not target_ip.startswith("127."):
            logger.warning(f"SOAR Triggered: Dropping malicious IP {target_ip}")
            return ContainmentActions.block_ip(target_ip)

        return None
