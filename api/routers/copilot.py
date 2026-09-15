"""
SENTINEL Phase 3: Autonomous AI SOC Co-Pilot & Threat Hunter API Router
Provides incident synthesis, MITRE correlation narrative, natural-language threat hunting,
and automated Incident Response (IR) reports.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from engine.copilot.analyst import copilot_engine
from datetime import datetime

router = APIRouter(prefix="/copilot", tags=["AI SOC Co-Pilot & Threat Hunting"])

# In-memory storage for saved IR post-mortems
INCIDENT_REPORTS: List[Dict[str, Any]] = [
    {
        "report_id": "IR-2026-0914-01",
        "title": "Post-Mortem: Multi-Stage Cobalt Strike C2 & Lateral Pivot",
        "incident_date": "2026-09-14T18:42:00Z",
        "threat_actor": "APT29 (Cozy Bear)",
        "status": "CONTAINED",
        "duration_minutes": 14,
        "affected_assets": ["DMZ-NGINX-EDGE", "ENG-WORKSTATION-04", "WIN-AD-KERBEROS-DC01"],
        "summary": "Attacker gained initial access through web exploitation, established jittered C2 beacons to 198.51.100.42, and attempted Pass-the-Hash against the Domain Controller before being zero-trust quarantined by Sentinel SOAR.",
        "contained_by": "AUTONOMOUS_PLAYBOOK_PB-01",
    }
]


class IncidentAnalysisRequest(BaseModel):
    title: Optional[str] = "Cobalt Strike C2 Beacon & Lateral Movement"
    src_ip: Optional[str] = "10.0.0.50"
    dst_ip: Optional[str] = "198.51.100.42"
    severity: Optional[str] = "CRITICAL"
    additional_context: Optional[str] = None


class ThreatHuntQueryRequest(BaseModel):
    query: str


class GenerateReportRequest(BaseModel):
    title: str
    threat_actor: str
    summary: str
    affected_assets: List[str]


@router.post("/analyze")
def analyze_incident_with_ai(payload: IncidentAnalysisRequest):
    """Synthesize incident root cause, MITRE kill chain, and generate remediation code."""
    analysis = copilot_engine.analyze_incident(payload.dict())
    return analysis


@router.post("/query")
def run_natural_language_threat_hunt(payload: ThreatHuntQueryRequest):
    """Execute a natural-language threat hunting query over low-level telemetry."""
    result = copilot_engine.execute_threat_hunt(payload.query)
    return result


@router.get("/reports")
def list_incident_reports():
    """Retrieve all structured Incident Response (IR) post-mortem reports."""
    return {
        "total_reports": len(INCIDENT_REPORTS),
        "reports": INCIDENT_REPORTS,
    }


@router.post("/reports")
def create_incident_report(payload: GenerateReportRequest):
    """Archive a new post-mortem Incident Response report."""
    rep_id = f"IR-{datetime.utcnow().strftime('%Y-%m%d')}-{len(INCIDENT_REPORTS) + 1:02d}"
    new_rep = {
        "report_id": rep_id,
        "title": payload.title,
        "incident_date": datetime.utcnow().isoformat() + "Z",
        "threat_actor": payload.threat_actor,
        "status": "CONTAINED",
        "duration_minutes": 8,
        "affected_assets": payload.affected_assets,
        "summary": payload.summary,
        "contained_by": "AUTONOMOUS_SOAR_COPILOT",
    }
    INCIDENT_REPORTS.insert(0, new_rep)
    return new_rep
