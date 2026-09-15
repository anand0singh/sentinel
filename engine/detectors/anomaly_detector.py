"""
Unsupervised Anomaly & C2 Beaconing Detector
Uses Isolation Forest and Sliding Window Inter-Arrival Time (IAT) Variance
to identify covert C2 communication channels and anomalous payloads.
"""
import time
import logging
from collections import defaultdict
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest

logger = logging.getLogger("Sentinel-AnomalyDetector")


class AnomalyDetector:
    def __init__(self, contamination: float = 0.02, beacon_window_size: int = 10):
        self.contamination = contamination
        self.beacon_window_size = beacon_window_size
        self.flow_history = defaultdict(list)  # (src_ip, dst_ip) -> timestamps
        self.model = IsolationForest(contamination=self.contamination, random_state=42)
        self.is_fitted = False
        self._warmup_model()

    def _warmup_model(self):
        """Pre-fit Isolation Forest on synthetic benign baseline network flow telemetry."""
        # Features: [bytes_out, bytes_in, duration, packet_count]
        np.random.seed(42)
        benign_data = np.random.normal(loc=[500, 1500, 2.0, 10], scale=[100, 300, 0.5, 2], size=(500, 4))
        benign_data = np.clip(benign_data, a_min=1, a_max=None)
        self.model.fit(benign_data)
        self.is_fitted = True
        logger.info("Isolation Forest anomaly model initialized and baseline fitted.")

    def inspect_beaconing(self, src_ip: str, dst_ip: str, timestamp: Optional[float] = None) -> Optional[Dict[str, Any]]:
        """
        Detects low-and-slow C2 beaconing by measuring the jitter (coefficient of variation)
        of inter-arrival times across successive connections.
        """
        ts = timestamp if timestamp else time.time()
        flow_key = (src_ip, dst_ip)
        self.flow_history[flow_key].append(ts)

        # Retain bounded window
        if len(self.flow_history[flow_key]) > self.beacon_window_size:
            self.flow_history[flow_key] = self.flow_history[flow_key][-self.beacon_window_size:]

        history = self.flow_history[flow_key]
        if len(history) < self.beacon_window_size:
            return None

        # Calculate Inter-Arrival Times (IAT)
        iats = np.diff(history)
        mean_iat = np.mean(iats)
        std_iat = np.std(iats)

        # Coefficient of variation (Jitter)
        jitter = (std_iat / mean_iat) if mean_iat > 0 else 1.0

        # Consistent periodic intervals with low variance indicate automated beaconing
        if mean_iat >= 0.5 and jitter < 0.15:
            return {
                "title": f"Covert C2 Beaconing Detected ({src_ip} -> {dst_ip})",
                "severity": "CRITICAL",
                "mitre_tactic": "Command and Control",
                "mitre_technique": "T1071.001",
                "source_ip": src_ip,
                "destination_ip": dst_ip,
                "process_name": "unknown-agent",
                "attack_chain_stage": "C2",
                "confidence": float(round(1.0 - jitter, 2)),
                "description": f"Highly regular beaconing detected. Interval: {mean_iat:.2f}s, Jitter: {jitter:.3f}",
                "forensic_payload": str({"mean_iat": mean_iat, "jitter": jitter, "window": self.beacon_window_size}),
            }
        return None

    def inspect_payload_anomaly(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Inspect byte and packet volume anomalies using Isolation Forest."""
        if not self.is_fitted:
            return None

        bytes_out = float(event.get("bytes_out", 500))
        bytes_in = float(event.get("bytes_in", 1500))
        duration = float(event.get("duration", 2.0))
        pkts = float(event.get("packet_count", 10))

        sample = np.array([[bytes_out, bytes_in, duration, pkts]])
        score = self.model.decision_function(sample)[0]
        prediction = self.model.predict(sample)[0]

        if prediction == -1:  # Anomaly identified
            return {
                "title": f"Volumetric Traffic Anomaly ({event.get('source_ip')} -> {event.get('destination_ip')})",
                "severity": "HIGH",
                "mitre_tactic": "Exfiltration",
                "mitre_technique": "T1048",
                "source_ip": event.get("source_ip", "0.0.0.0"),
                "destination_ip": event.get("destination_ip", "0.0.0.0"),
                "process_name": event.get("process_name", "network-layer"),
                "attack_chain_stage": "EXFILTRATION",
                "confidence": float(min(1.0, abs(score) + 0.5)),
                "description": f"Unusual volumetric pattern detected. Isolation score: {score:.4f}",
                "forensic_payload": str(event),
            }
        return None
