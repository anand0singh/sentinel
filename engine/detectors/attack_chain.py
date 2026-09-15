"""
Attack-Chain Graph Correlation Engine
Tracks entities and stages across a sliding time window.
Synthesizes root attack alerts when sequential kill-chain stages are satisfied:
Recon (T1046) -> Exploitation (T1190) -> Shell/Execution (T1059) -> C2/Exfil (T1048/T1071).
"""
import time
import logging
from collections import defaultdict
from typing import Dict, Any, List, Optional

logger = logging.getLogger("Sentinel-AttackChain")

try:
    import networkx as nx
except ImportError:
    nx = None

KILL_CHAIN_ORDER = {
    "RECON": 1,
    "EXPLOITATION": 2,
    "EXECUTION": 3,
    "C2": 4,
    "EXFILTRATION": 5,
}


class AttackChainCorrelator:
    def __init__(self, window_seconds: int = 60):
        self.window_seconds = window_seconds
        # Mapping host/IP -> list of alerts within time window
        self.host_windows = defaultdict(list)
        self.graph = nx.DiGraph() if nx else None

    def _purge_stale_events(self, current_time: float):
        """Evict events outside sliding correlation window."""
        cutoff = current_time - self.window_seconds
        for entity in list(self.host_windows.keys()):
            self.host_windows[entity] = [
                alert for alert in self.host_windows[entity]
                if alert.get("_time", 0) >= cutoff
            ]
            if not self.host_windows[entity]:
                del self.host_windows[entity]

    def ingest_alert(self, alert: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Process an incoming detection alert, map into the entity relationship graph,
        and evaluate if a multi-stage attack chain condition has been met.
        """
        now = time.time()
        alert["_time"] = now
        self._purge_stale_events(now)

        src = alert.get("source_ip", "")
        dst = alert.get("destination_ip", "")
        proc = alert.get("process_name", "kernel")
        stage = alert.get("attack_chain_stage")

        # Associate alert with all involved non-generic entities
        entities_to_track = set()
        for ip in [dst, src]:
            if ip and ip not in ("0.0.0.0", "127.0.0.1"):
                entities_to_track.add(ip)

        if not entities_to_track:
            entities_to_track.add("default-entity")

        for entity in entities_to_track:
            self.host_windows[entity].append(alert)

        # Update entity graph if networkx is available
        if self.graph is not None:
            self.graph.add_node(src, type="ip_source")
            self.graph.add_node(dst, type="ip_target")
            self.graph.add_node(proc, type="process")
            self.graph.add_edge(src, dst, relation="targeted", stage=stage)

        # Evaluate kill chain stages across tracked entities
        for entity in entities_to_track:
            alerts = self.host_windows[entity]
            stages_observed = {a.get("attack_chain_stage") for a in alerts if a.get("attack_chain_stage")}

            # If >= 3 distinct sequential stages appear in the window, trigger ATTACK-CHAIN-DETECTED
            if len(stages_observed) >= 3:
                sorted_stages = sorted(list(stages_observed), key=lambda s: KILL_CHAIN_ORDER.get(s, 99))
                synthesized_alert = {
                    "title": f"CRITICAL: Multi-Stage Attack Chain Detected on {entity}",
                    "severity": "CRITICAL",
                    "mitre_tactic": "Multi-Stage Campaign",
                    "mitre_technique": "ATTACK-CHAIN-DETECTED",
                    "source_ip": src,
                    "destination_ip": dst,
                    "process_name": proc,
                    "attack_chain_stage": "CRITICAL-ROOT",
                    "confidence": 0.99,
                    "description": f"Sequential attack chain progression observed: {' -> '.join(sorted_stages)} within {self.window_seconds}s.",
                    "forensic_payload": str({
                        "entity": entity,
                        "stages": sorted_stages,
                        "stages_count": len(sorted_stages),
                        "alert_count": len(alerts),
                        "alert_titles": [a.get("title") for a in alerts]
                    }),
                    "containment_status": "REQUIRED",
                }
                # Clear host window to avoid duplicate parent alerts
                self.host_windows[entity] = []
                return synthesized_alert

        return None
