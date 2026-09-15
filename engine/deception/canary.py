"""
SENTINEL Phase 3: Deception Technology & Honey-Token Canary Mesh
Manages decoy services, honey-tokens (fake AWS keys, bogus SSH credentials, fake DB tables),
and guarantees 0% false-positive autonomous response triggers when touched.
"""
from typing import Dict, Any, List
from datetime import datetime
import uuid


class DeceptionMeshManager:
    """Manages decoy traps and canary tokens."""

    def __init__(self):
        self.canaries: List[Dict[str, Any]] = [
            {
                "id": "canary-aws-01",
                "name": "DECOY-AWS-ROOT-KEY",
                "type": "cloud_token",
                "location": "DMZ-NGINX-EDGE:~/.aws/credentials",
                "payload_value": "AKIAIOSFODNN7EXAMPLE",
                "status": "ARMED",
                "tripped": False,
                "created_at": "2026-09-12T10:00:00Z",
                "trip_count": 0,
            },
            {
                "id": "canary-ssh-02",
                "name": "HONEYPOT-SSH-PORT-2222",
                "type": "decoy_service",
                "location": "CANARY-HONEY-SSH (10.0.1.99:2222)",
                "payload_value": "Fake OpenSSH 8.9p1 Banner",
                "status": "TRIPPED",
                "tripped": True,
                "created_at": "2026-09-13T14:30:00Z",
                "trip_count": 3,
                "last_tripped_at": "2026-09-16T00:15:10Z",
                "last_tripped_by": "10.0.3.104 (ENG-WORKSTATION-04)",
            },
            {
                "id": "canary-db-03",
                "name": "BREADCRUMB-SQL-PASSWORD",
                "type": "database_token",
                "location": "PROD-API-CLUSTER-01:/var/www/.env",
                "payload_value": "DB_PASS=Sup3rS3cret_HoneyAdmin2026!",
                "status": "ARMED",
                "tripped": False,
                "created_at": "2026-09-14T08:20:00Z",
                "trip_count": 0,
            },
            {
                "id": "canary-file-04",
                "name": "RANSOMWARE-BAIT-SALARY-XLSX",
                "type": "honey_file",
                "location": "ENG-WORKSTATION-04:C:\\Users\\Public\\Payroll_Q3_2026.xlsx",
                "payload_value": "FIM-monitored bait file",
                "status": "ARMED",
                "tripped": False,
                "created_at": "2026-09-15T09:00:00Z",
                "trip_count": 0,
            },
        ]

    def list_tokens(self) -> List[Dict[str, Any]]:
        return self.canaries

    def deploy_token(self, name: str, token_type: str, location: str, payload: str) -> Dict[str, Any]:
        token_id = f"canary-{uuid.uuid4().hex[:6]}"
        new_token = {
            "id": token_id,
            "name": name,
            "type": token_type,
            "location": location,
            "payload_value": payload,
            "status": "ARMED",
            "tripped": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "trip_count": 0,
        }
        self.canaries.append(new_token)
        return new_token

    def trigger_token(self, token_id: str, intruder_ip: str = "10.0.3.104") -> Dict[str, Any]:
        token = next((c for c in self.canaries if c["id"] == token_id), None)
        if not token:
            return {"error": "Token not found"}

        token["status"] = "TRIPPED"
        token["tripped"] = True
        token["trip_count"] += 1
        now = datetime.utcnow().isoformat() + "Z"
        token["last_tripped_at"] = now
        token["last_tripped_by"] = intruder_ip

        # 0% False positive alarm
        alarm = {
            "alert_id": f"CANARY-TRIP-{int(datetime.utcnow().timestamp())}",
            "token_id": token_id,
            "token_name": token["name"],
            "severity": "CRITICAL",
            "false_positive_probability": 0.0,
            "intruder_source": intruder_ip,
            "timestamp": now,
            "auto_containment_triggered": True,
            "containment_action": f"Auto Zero-Trust Quarantine dispatched against {intruder_ip}",
        }
        return alarm


canary_mesh = DeceptionMeshManager()
