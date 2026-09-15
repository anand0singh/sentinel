"""
Containment & SOAR Router
Endpoints for manual containment overrides and active response actions.
"""
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from engine.response.actions import ContainmentActions

router = APIRouter(prefix="/containment", tags=["Containment"])


class BlockIPRequest(BaseModel):
    ip_address: str


class KillProcessRequest(BaseModel):
    pid: int
    process_name: str = ""


@router.post("/isolate/{host_id}")
def isolate_host(host_id: str):
    """Manually quarantine a host endpoint from the network."""
    result = ContainmentActions.isolate_host(host_id)
    return {"status": "success", "result": result}


@router.post("/block-ip")
def block_ip(req: BlockIPRequest):
    """Block an offending external or internal IP address."""
    result = ContainmentActions.block_ip(req.ip_address)
    return {"status": "success", "result": result}


@router.post("/kill-process")
def kill_process(req: KillProcessRequest):
    """Terminate malicious process by PID."""
    result = ContainmentActions.kill_process(req.pid, req.process_name)
    if result.get("status") == "REJECTED":
        raise HTTPException(status_code=400, detail=result.get("reason"))
    return {"status": "success", "result": result}
