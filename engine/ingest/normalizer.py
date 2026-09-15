"""
Elastic Common Schema (ECS) Normalizer
Transforms raw heterogeneous log structures (Suricata, Zeek, eBPF, Syslog)
into unified, type-safe Sentinel ECS representation.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger("Sentinel-Normalizer")


class ECSNormalizer:
    @staticmethod
    def normalize_suricata(raw: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize Suricata EVE JSON event to ECS."""
        alert = raw.get("alert", {})
        return {
            "timestamp": raw.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "event_category": "network",
            "event_dataset": "suricata",
            "source_ip": raw.get("src_ip", "0.0.0.0"),
            "source_port": int(raw.get("src_port", 0)),
            "destination_ip": raw.get("dest_ip", "0.0.0.0"),
            "destination_port": int(raw.get("dest_port", 0)),
            "network_protocol": str(raw.get("proto", "TCP")).lower(),
            "process_name": "suricata",
            "process_pid": 0,
            "process_parent_pid": 0,
            "process_command_line": "",
            "user_name": "system",
            "threat_matched": 1 if alert else 0,
            "threat_score": float(alert.get("severity", 1.0)) * 25.0 if alert else 0.0,
            "raw_payload": str(raw),
            "signature": alert.get("signature", ""),
            "signature_id": alert.get("signature_id", 0),
        }

    @staticmethod
    def normalize_endpoint(raw: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize endpoint telemetry (eBPF, Sysmon, Osquery) to ECS."""
        proc = raw.get("process", {})
        dest = raw.get("destination", {})
        user = raw.get("user", {})

        return {
            "timestamp": raw.get("@timestamp", datetime.now(timezone.utc).isoformat()),
            "event_category": "endpoint",
            "event_dataset": raw.get("event", {}).get("dataset", "sentinel.ebpf"),
            "source_ip": raw.get("source", {}).get("ip", "127.0.0.1"),
            "source_port": int(raw.get("source", {}).get("port", 0)),
            "destination_ip": dest.get("ip", "0.0.0.0"),
            "destination_port": int(dest.get("port", 0)),
            "network_protocol": "tcp",
            "process_name": proc.get("name", ""),
            "process_pid": int(proc.get("pid", 0)),
            "process_parent_pid": int(proc.get("parent", {}).get("pid", 0)),
            "process_command_line": proc.get("command_line", ""),
            "user_name": user.get("name", user.get("id", "root")),
            "threat_matched": 0,
            "threat_score": 0.0,
            "raw_payload": str(raw),
            "signature": "",
            "signature_id": 0,
        }

    @classmethod
    def process(cls, event_type: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            if event_type == "network":
                return cls.normalize_suricata(data)
            elif event_type == "endpoint":
                return cls.normalize_endpoint(data)
            return None
        except Exception as e:
            logger.error(f"Error normalizing payload: {e}")
            return None
