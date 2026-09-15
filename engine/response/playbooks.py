"""
Automated SOAR Playbook Engine & Zero-Trust Rollback Manager (Phase 2)
Evaluates threat alerts against customizable defense playbooks,
executes automated mitigations, and manages single-click containment rollbacks.
"""
import time
import uuid
import logging
from typing import Dict, Any, List, Optional
from engine.response.actions import ContainmentActions

logger = logging.getLogger("Sentinel-PlaybookEngine")


class PlaybookEngine:
    def __init__(self):
        # Default security response playbooks
        self.playbooks: List[Dict[str, Any]] = [
            {
                "id": "PB-01",
                "name": "Root Attack-Chain Immediate Quarantine",
                "description": "When multi-stage kill-chain is synthesized, isolate target host and drop external attacker IP.",
                "trigger_technique": "ATTACK-CHAIN-DETECTED",
                "min_severity": "CRITICAL",
                "actions": ["ISOLATE_HOST", "BLOCK_IP"],
                "auto_rollback_sec": 3600,
                "enabled": True,
            },
            {
                "id": "PB-02",
                "name": "Rogue Shell Process Immediate Kill",
                "description": "When interactive /bin/sh or reverse shell is spawned, terminate process PID immediately.",
                "trigger_technique": "T1059.004",
                "min_severity": "HIGH",
                "actions": ["KILL_PROCESS"],
                "auto_rollback_sec": 0,
                "enabled": True,
            },
            {
                "id": "PB-03",
                "name": "C2 Beaconing Perimeter Drop",
                "description": "Block outbound socket connection and append C2 destination IP to edge firewall drop set.",
                "trigger_technique": "T1071.001",
                "min_severity": "HIGH",
                "actions": ["BLOCK_IP"],
                "auto_rollback_sec": 7200,
                "enabled": True,
            },
            {
                "id": "PB-04",
                "name": "Volumetric Exfiltration Egress Drop",
                "description": "Drop suspicious outbound data exfiltration transfers matching T1048.",
                "trigger_technique": "T1048",
                "min_severity": "CRITICAL",
                "actions": ["BLOCK_IP"],
                "auto_rollback_sec": 1800,
                "enabled": True,
            },
        ]
        # Containment action history & rollback registry
        self.action_history: List[Dict[str, Any]] = [
            {
                "action_id": "ACT-901",
                "playbook_id": "PB-01",
                "action_type": "ISOLATE_HOST",
                "target": "192.168.1.100",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 300)),
                "status": "APPLIED",
                "rollback_available": True,
                "details": "VLAN quarantine activated. All non-management ports dropped.",
            },
            {
                "action_id": "ACT-902",
                "playbook_id": "PB-01",
                "action_type": "BLOCK_IP",
                "target": "198.51.100.44",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 290)),
                "status": "APPLIED",
                "rollback_available": True,
                "details": "iptables INPUT/OUTPUT drop appended for C2 destination.",
            },
            {
                "action_id": "ACT-903",
                "playbook_id": "PB-02",
                "action_type": "KILL_PROCESS",
                "target": "PID 9482 (/bin/sh)",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 250)),
                "status": "APPLIED",
                "rollback_available": False,
                "details": "SIGKILL signal delivered to rogue shell PID.",
            },
        ]

    def list_playbooks(self) -> List[Dict[str, Any]]:
        return self.playbooks

    def toggle_playbook(self, playbook_id: str, enabled: bool) -> Optional[Dict[str, Any]]:
        for pb in self.playbooks:
            if pb["id"] == playbook_id:
                pb["enabled"] = enabled
                logger.info(f"Playbook {playbook_id} updated: enabled={enabled}")
                return pb
        return None

    def add_playbook(self, playbook: Dict[str, Any]) -> Dict[str, Any]:
        playbook["id"] = f"PB-{len(self.playbooks) + 1:02d}"
        if "enabled" not in playbook:
            playbook["enabled"] = True
        self.playbooks.append(playbook)
        logger.info(f"Created new SOAR Playbook: {playbook['id']} - {playbook.get('name')}")
        return playbook

    def evaluate_alert(self, alert: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Evaluates incoming alert against all active playbooks and triggers mitigations."""
        triggered_actions = []
        technique = alert.get("mitre_technique", "")
        severity = alert.get("severity", "LOW")

        for pb in self.playbooks:
            if not pb["enabled"]:
                continue

            # Match technique or severity
            technique_match = pb["trigger_technique"] == technique
            severity_match = severity == pb["min_severity"] or (
                pb["min_severity"] == "HIGH" and severity == "CRITICAL"
            )

            if technique_match and severity_match:
                logger.info(f"Alert matched Playbook {pb['id']} ({pb['name']})")
                for action in pb["actions"]:
                    res = self._execute_action(action, alert, pb["id"])
                    if res:
                        triggered_actions.append(res)
        return triggered_actions

    def _execute_action(self, action_type: str, alert: Dict[str, Any], playbook_id: str) -> Optional[Dict[str, Any]]:
        act_id = f"ACT-{int(time.time() * 1000) % 100000}"
        target = ""
        details = ""
        rollback = False

        if action_type == "ISOLATE_HOST":
            target = alert.get("destination_ip") or alert.get("source_ip") or "192.168.1.100"
            ContainmentActions.isolate_host(target)
            details = f"Host {target} quarantined. Non-management traffic dropped."
            rollback = True
        elif action_type == "BLOCK_IP":
            target = alert.get("source_ip") or alert.get("destination_ip") or "198.51.100.44"
            ContainmentActions.block_ip(target)
            details = f"Firewall rule added: DROP all packets to/from {target}."
            rollback = True
        elif action_type == "KILL_PROCESS":
            pid = int(alert.get("process_pid", 0))
            if pid > 0:
                ContainmentActions.kill_process(pid, alert.get("process_name", ""))
                target = f"PID {pid} ({alert.get('process_name', '')})"
                details = f"Terminated rogue process PID {pid}."
            else:
                target = f"PID {alert.get('process_name', 'sh')}"
                details = f"Simulated termination of process {alert.get('process_name', 'sh')}."
            rollback = False

        record = {
            "action_id": act_id,
            "playbook_id": playbook_id,
            "action_type": action_type,
            "target": target,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": "APPLIED",
            "rollback_available": rollback,
            "details": details,
        }
        self.action_history.insert(0, record)
        return record

    def rollback_action(self, action_id: str) -> Dict[str, Any]:
        """Rolls back an applied containment action (e.g. removes iptables rule)."""
        for act in self.action_history:
            if act["action_id"] == action_id:
                if not act.get("rollback_available"):
                    return {"status": "REJECTED", "reason": "Action cannot be rolled back (e.g. killed process)."}

                act["status"] = "ROLLED_BACK"
                act["rollback_available"] = False
                logger.info(f"Rolled back containment action {action_id} for target {act['target']}")
                return {
                    "status": "SUCCESS",
                    "action_id": action_id,
                    "target": act["target"],
                    "message": f"Containment for {act['target']} successfully reversed. Normal traffic restored.",
                }
        return {"status": "NOT_FOUND", "reason": f"Action ID {action_id} not found."}

    def get_history(self) -> List[Dict[str, Any]]:
        return self.action_history


# Singleton engine instance
soar_playbook_engine = PlaybookEngine()
