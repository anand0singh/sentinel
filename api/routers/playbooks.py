"""
SOAR Playbooks & Containment Rollback Router (Phase 2)
Provides endpoints to manage automated mitigation policies and reverse quarantines.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from engine.response.playbooks import soar_playbook_engine

router = APIRouter(prefix="/playbooks", tags=["SOAR Playbooks"])


class PlaybookCreateRequest(BaseModel):
    name: str
    description: str
    trigger_technique: str
    min_severity: str = "HIGH"
    actions: List[str]
    auto_rollback_sec: int = 3600
    enabled: bool = True


class ToggleRequest(BaseModel):
    enabled: bool


@router.get("/")
def list_playbooks():
    """Retrieve all automated SOAR playbooks."""
    return {"count": len(soar_playbook_engine.list_playbooks()), "playbooks": soar_playbook_engine.list_playbooks()}


@router.post("/")
def create_playbook(req: PlaybookCreateRequest):
    """Create a new automated SOAR containment playbook."""
    created = soar_playbook_engine.add_playbook(req.dict())
    return {"status": "success", "playbook": created}


@router.patch("/{playbook_id}/toggle")
def toggle_playbook(playbook_id: str, req: ToggleRequest):
    """Enable or disable an automated playbook."""
    updated = soar_playbook_engine.toggle_playbook(playbook_id, req.enabled)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Playbook {playbook_id} not found.")
    return {"status": "success", "playbook": updated}


@router.post("/rollback/{action_id}")
def rollback_action(action_id: str):
    """Reverses an applied containment action (e.g. unblocks IP or releases host quarantine)."""
    res = soar_playbook_engine.rollback_action(action_id)
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=404, detail=res.get("reason"))
    if res.get("status") == "REJECTED":
        raise HTTPException(status_code=400, detail=res.get("reason"))
    return res


@router.get("/history")
def get_containment_history():
    """Returns the historical audit trail of all automated SOAR actions taken."""
    history = soar_playbook_engine.get_history()
    return {"count": len(history), "history": history}
