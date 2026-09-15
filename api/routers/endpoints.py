"""
SENTINEL Phase 3: Endpoint Fleet Matrix & eBPF Telemetry API Router
Tracks monitored fleet nodes, streams kernel-level eBPF probes, and executes edge containment.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/endpoints", tags=["Endpoint Fleet & eBPF Telemetry"])

# In-memory fleet inventory
FLEET_ENDPOINTS: List[Dict[str, Any]] = [
    {
        "id": "ep-lin-01",
        "hostname": "DMZ-NGINX-EDGE",
        "os": "Ubuntu 22.04 LTS (Kernel 6.2.0-generic)",
        "ip": "10.0.0.50",
        "agent_version": "v1.4.2",
        "status": "COMPROMISED",
        "ebpf_probes_attached": 12,
        "probes_status": "ACTIVE",
        "cpu_usage": "34%",
        "mem_usage": "61%",
        "last_seen": "2s ago",
        "compromised": True,
    },
    {
        "id": "ep-lin-02",
        "hostname": "PROD-API-CLUSTER-01",
        "os": "Debian 12 Bookworm (Kernel 6.1.0)",
        "ip": "10.0.1.10",
        "agent_version": "v1.4.2",
        "status": "ONLINE",
        "ebpf_probes_attached": 12,
        "probes_status": "ACTIVE",
        "cpu_usage": "68%",
        "mem_usage": "72%",
        "last_seen": "1s ago",
        "compromised": False,
    },
    {
        "id": "ep-lin-03",
        "hostname": "CORE-POSTGRES-PRIMARY",
        "os": "RHEL 9.3 (Kernel 5.14.0)",
        "ip": "10.0.2.15",
        "agent_version": "v1.4.0",
        "status": "ONLINE",
        "ebpf_probes_attached": 12,
        "probes_status": "ACTIVE",
        "cpu_usage": "42%",
        "mem_usage": "88%",
        "last_seen": "3s ago",
        "compromised": False,
    },
    {
        "id": "ep-win-01",
        "hostname": "ENG-WORKSTATION-04",
        "os": "Windows 11 Pro 23H2 (Build 22631)",
        "ip": "10.0.3.104",
        "agent_version": "v1.3.8-win",
        "status": "COMPROMISED",
        "ebpf_probes_attached": 8,
        "probes_status": "HOOKED",
        "cpu_usage": "81%",
        "mem_usage": "79%",
        "last_seen": "1s ago",
        "compromised": True,
    },
    {
        "id": "ep-win-02",
        "hostname": "WIN-AD-KERBEROS-DC01",
        "os": "Windows Server 2022 Datacenter",
        "ip": "10.0.1.5",
        "agent_version": "v1.4.1-win",
        "status": "AT_RISK",
        "ebpf_probes_attached": 8,
        "probes_status": "HOOKED",
        "cpu_usage": "51%",
        "mem_usage": "64%",
        "last_seen": "2s ago",
        "compromised": False,
    },
]

# Simulated eBPF low-level kernel event feed
SAMPLE_EBPF_EVENTS: Dict[str, List[Dict[str, Any]]] = {
    "ep-lin-01": [
        {
            "timestamp": "2026-09-16T00:12:44Z",
            "probe": "sys_enter_execve",
            "pid": 4912,
            "uid": 0,
            "comm": "python3",
            "args": "/usr/local/bin/python3 -c 'import socket...'",
            "verdict": "ANOMALOUS_SHELL_SPAWN",
            "severity": "CRITICAL",
        },
        {
            "timestamp": "2026-09-16T00:12:43Z",
            "probe": "security_socket_connect",
            "pid": 4912,
            "uid": 0,
            "comm": "python3",
            "args": "AF_INET 198.51.100.42:4444",
            "verdict": "UNCLASSIFIED_EXTERNAL_EGRESS",
            "severity": "HIGH",
        },
        {
            "timestamp": "2026-09-16T00:11:02Z",
            "probe": "do_mprotect_exec",
            "pid": 1104,
            "uid": 33,
            "comm": "nginx",
            "args": "PROT_READ|PROT_WRITE|PROT_EXEC",
            "verdict": "SHELLCODE_PAGE_PERMISSION_CHANGE",
            "severity": "CRITICAL",
        },
    ],
    "ep-win-01": [
        {
            "timestamp": "2026-09-16T00:14:10Z",
            "probe": "etw_process_create",
            "pid": 8192,
            "uid": 1004,
            "comm": "powershell.exe",
            "args": "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc JAB...",
            "verdict": "ENCODED_EXECUTION_BYPASS",
            "severity": "CRITICAL",
        },
        {
            "timestamp": "2026-09-16T00:13:58Z",
            "probe": "etw_credential_access",
            "pid": 3012,
            "uid": 1004,
            "comm": "lsass.exe",
            "args": "OpenProcess PROCESS_VM_READ from mimikatz.exe",
            "verdict": "LSASS_MEMORY_READ_INJECTION",
            "severity": "CRITICAL",
        },
    ],
}


class EndpointActionRequest(BaseModel):
    action: str  # isolate, terminate_process, dump_memory, restart_probe
    pid: Optional[int] = None
    reason: Optional[str] = "SOC analyst remediation command"


@router.get("")
def list_endpoints():
    """List all registered endpoints in the SENTINEL fleet."""
    return {
        "fleet_total": len(FLEET_ENDPOINTS),
        "online_count": len([e for e in FLEET_ENDPOINTS if e["status"] in ["ONLINE", "COMPROMISED", "AT_RISK"]]),
        "compromised_count": len([e for e in FLEET_ENDPOINTS if e["compromised"]]),
        "endpoints": FLEET_ENDPOINTS,
    }


@router.get("/{endpoint_id}/probes")
def get_endpoint_probe_stream(endpoint_id: str):
    """Retrieve real-time eBPF kernel probes for a specific endpoint."""
    events = SAMPLE_EBPF_EVENTS.get(endpoint_id, [
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "probe": "sys_enter_read",
            "pid": 1024,
            "uid": 1000,
            "comm": "systemd",
            "args": "/dev/urandom",
            "verdict": "BENIGN_TELEMETRY",
            "severity": "LOW",
        }
    ])
    return {
        "endpoint_id": endpoint_id,
        "event_count": len(events),
        "events": events,
    }


@router.post("/{endpoint_id}/action")
def execute_endpoint_action(endpoint_id: str, payload: EndpointActionRequest):
    """Execute low-level edge remediation on endpoint agent."""
    ep = next((e for e in FLEET_ENDPOINTS if e["id"] == endpoint_id), None)
    if not ep:
        raise HTTPException(status_code=404, detail=f"Endpoint {endpoint_id} not found in fleet")

    action = payload.action.lower()
    if action == "isolate":
        ep["status"] = "ISOLATED"
        message = f"Zero-trust firewall rules applied to {ep['hostname']}. All inbound/outbound packets severed."
    elif action == "terminate_process":
        message = f"SIGKILL (9) dispatched to PID {payload.pid or 'ALL_ANOMALOUS'} on {ep['hostname']}."
    elif action == "dump_memory":
        message = f"Initiated full process address space core dump on {ep['hostname']} to forensic bucket."
    elif action == "restart_probe":
        ep["probes_status"] = "REHOOKED"
        message = f"eBPF hooks re-attached to kernel tracepoints on {ep['hostname']}."
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {payload.action}")

    return {
        "status": "SUCCESS",
        "action": action,
        "endpoint_id": endpoint_id,
        "hostname": ep["hostname"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "message": message,
    }
