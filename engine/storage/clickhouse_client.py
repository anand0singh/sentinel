"""
Sentinel ClickHouse Storage Client
Provides high-performance inserts and queries for telemetry events and detection alerts.
"""
import os
import uuid
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger("Sentinel-ClickHouseClient")

CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", "8123"))
CLICKHOUSE_DB = os.getenv("CLICKHOUSE_DB", "sentinel")
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "sentinel_clickhouse_password")


class ClickHouseClient:
    def __init__(self):
        self.client = None
        self._connect()

    def _connect(self):
        try:
            import clickhouse_connect
            self.client = clickhouse_connect.get_client(
                host=CLICKHOUSE_HOST,
                port=CLICKHOUSE_PORT,
                database=CLICKHOUSE_DB,
                username=CLICKHOUSE_USER,
                password=CLICKHOUSE_PASSWORD,
                connect_timeout=3,
            )
            logger.info(f"Connected to ClickHouse database '{CLICKHOUSE_DB}' at {CLICKHOUSE_HOST}:{CLICKHOUSE_PORT}")
        except Exception as e:
            logger.warning(f"ClickHouse unavailable ({e}). Running with in-memory buffer mode.")
            self.client = None
            self._in_memory_alerts: List[Dict[str, Any]] = []
            self._in_memory_events: List[Dict[str, Any]] = []

    def insert_events(self, events: List[Dict[str, Any]]):
        if not events:
            return

        if not self.client:
            self._in_memory_events.extend(events)
            return

        rows = []
        for e in events:
            rows.append([
                datetime.now(timezone.utc),
                e.get("event_category", "unknown"),
                e.get("event_dataset", "unknown"),
                e.get("source_ip", "0.0.0.0"),
                int(e.get("source_port", 0)),
                e.get("destination_ip", "0.0.0.0"),
                int(e.get("destination_port", 0)),
                e.get("network_protocol", "tcp"),
                e.get("process_name", ""),
                int(e.get("process_pid", 0)),
                int(e.get("process_parent_pid", 0)),
                e.get("process_command_line", ""),
                e.get("user_name", "system"),
                int(e.get("threat_matched", 0)),
                float(e.get("threat_score", 0.0)),
                e.get("geo_country", "ZZ"),
                str(e.get("raw_payload", "")),
            ])
        column_names = [
            "timestamp", "event_category", "event_dataset", "source_ip", "source_port",
            "destination_ip", "destination_port", "network_protocol", "process_name",
            "process_pid", "process_parent_pid", "process_command_line", "user_name",
            "threat_matched", "threat_score", "geo_country", "raw_payload"
        ]
        try:
            self.client.insert("sentinel.sentinel_events", rows, column_names=column_names)
        except Exception as err:
            logger.error(f"Error writing batch to ClickHouse events: {err}")

    def insert_alert(self, alert: Dict[str, Any]):
        alert_id = alert.get("alert_id", str(uuid.uuid4()))
        if not self.client:
            alert["alert_id"] = alert_id
            alert["timestamp"] = alert.get("timestamp", datetime.now(timezone.utc).isoformat())
            self._in_memory_alerts.append(alert)
            return

        row = [
            alert_id,
            datetime.now(timezone.utc),
            alert.get("title", "Untitled Alert"),
            alert.get("severity", "MEDIUM"),
            alert.get("mitre_tactic", "Unknown"),
            alert.get("mitre_technique", "Unknown"),
            alert.get("source_ip", "0.0.0.0"),
            alert.get("destination_ip", "0.0.0.0"),
            alert.get("process_name", "system"),
            alert.get("attack_chain_stage", "ALERT"),
            float(alert.get("confidence", 0.8)),
            alert.get("description", ""),
            str(alert.get("forensic_payload", "")),
            alert.get("containment_status", "PENDING"),
        ]
        col_names = [
            "alert_id", "timestamp", "title", "severity", "mitre_tactic",
            "mitre_technique", "source_ip", "destination_ip", "process_name",
            "attack_chain_stage", "confidence", "description", "forensic_payload",
            "containment_status"
        ]
        try:
            self.client.insert("sentinel.sentinel_alerts", [row], column_names=col_names)
        except Exception as err:
            logger.error(f"Error writing alert to ClickHouse: {err}")

    def get_recent_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.client:
            return list(reversed(self._in_memory_alerts))[:limit]

        try:
            query = f"SELECT * FROM sentinel.sentinel_alerts ORDER BY timestamp DESC LIMIT {limit}"
            result = self.client.query(query)
            return [dict(zip(result.column_names, row)) for row in result.result_rows]
        except Exception as e:
            logger.error(f"Error querying ClickHouse alerts: {e}")
            return []
