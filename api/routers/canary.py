"""
SENTINEL Phase 3: Deception Technology & Honey-Token Canary Mesh Router
Endpoints to manage decoys, trigger tripwires, and deploy new honeypot bait.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from engine.deception.canary import canary_mesh

router = APIRouter(prefix="/canary", tags=["Deception Technology & Canary Mesh"])


class DeployCanaryRequest(BaseModel):
    name: str
    token_type: str  # cloud_token, decoy_service, database_token, honey_file
    location: str
    payload_value: str


class TriggerCanaryRequest(BaseModel):
    token_id: str
    intruder_ip: Optional[str] = "10.0.3.104"


@router.get("/tokens")
def get_canary_tokens():
    """Retrieve all deployed honey-tokens and decoy traps."""
    tokens = canary_mesh.list_tokens()
    return {
        "total_tokens": len(tokens),
        "armed_count": len([t for t in tokens if t["status"] == "ARMED"]),
        "tripped_count": len([t for t in tokens if t["tripped"]]),
        "tokens": tokens,
    }


@router.post("/deploy")
def deploy_canary(payload: DeployCanaryRequest):
    """Deploy a new honeypot bait or canary token."""
    new_token = canary_mesh.deploy_token(
        name=payload.name,
        token_type=payload.token_type,
        location=payload.location,
        payload=payload.payload_value,
    )
    return new_token


@router.post("/trigger")
def trigger_canary(payload: TriggerCanaryRequest):
    """Simulate or report a touched canary token, firing 0% false positive auto-containment."""
    alarm = canary_mesh.trigger_token(payload.token_id, payload.intruder_ip)
    if "error" in alarm:
        raise HTTPException(status_code=404, detail=f"Canary {payload.token_id} not found")
    return alarm
