"""
SENTINEL Phase 3: Interactive Multi-Host Attack Topology & Blast-Radius Engine
Uses NetworkX to construct network graphs, track lateral movement vectors,
and compute blast-radius vulnerability propagation from compromised nodes.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import networkx as nx
from datetime import datetime

router = APIRouter(prefix="/topology", tags=["Attack Topology & Lateral Movement"])

# In-memory node and edge topology registry
TOPOLOGY_NODES: List[Dict[str, Any]] = [
    {
        "id": "node-fw-01",
        "label": "PFSENSE-GATEWAY-01",
        "type": "gateway",
        "ip": "10.0.0.1",
        "subnet": "10.0.0.0/24",
        "status": "healthy",
        "criticality": "HIGH",
        "cves": [],
        "blast_score": 12.5,
    },
    {
        "id": "node-srv-web",
        "label": "DMZ-NGINX-EDGE",
        "type": "server",
        "ip": "10.0.0.50",
        "subnet": "10.0.0.0/24",
        "status": "compromised",
        "criticality": "CRITICAL",
        "cves": ["CVE-2024-21413", "CVE-2023-44487"],
        "blast_score": 88.4,
        "compromise_reason": "Log4j / Initial Access Pivot",
    },
    {
        "id": "node-srv-app",
        "label": "PROD-API-CLUSTER-01",
        "type": "server",
        "ip": "10.0.1.10",
        "subnet": "10.0.1.0/24",
        "status": "at_risk",
        "criticality": "HIGH",
        "cves": ["CVE-2023-38606"],
        "blast_score": 64.2,
    },
    {
        "id": "node-srv-db",
        "label": "CORE-POSTGRES-PRIMARY",
        "type": "database",
        "ip": "10.0.2.15",
        "subnet": "10.0.2.0/24",
        "status": "healthy",
        "criticality": "CROWN_JEWEL",
        "cves": [],
        "blast_score": 35.0,
    },
    {
        "id": "node-ws-dev01",
        "label": "ENG-WORKSTATION-04",
        "type": "endpoint",
        "ip": "10.0.3.104",
        "subnet": "10.0.3.0/24",
        "status": "compromised",
        "criticality": "MEDIUM",
        "cves": ["CVE-2024-30051"],
        "blast_score": 76.9,
        "compromise_reason": "Pass-the-Hash / Credential Dumping",
    },
    {
        "id": "node-dc-01",
        "label": "WIN-AD-KERBEROS-DC01",
        "type": "domain_controller",
        "ip": "10.0.1.5",
        "subnet": "10.0.1.0/24",
        "status": "at_risk",
        "criticality": "CROWN_JEWEL",
        "cves": ["CVE-2022-26923"],
        "blast_score": 94.1,
    },
    {
        "id": "node-c2-ext",
        "label": "COBALT-STRIKE-C2",
        "type": "adversary_c2",
        "ip": "198.51.100.42",
        "subnet": "EXTERNAL",
        "status": "malicious",
        "criticality": "ADVERSARY",
        "cves": [],
        "blast_score": 100.0,
    },
    {
        "id": "node-decoy-ssh",
        "label": "CANARY-HONEY-SSH",
        "type": "honeypot",
        "ip": "10.0.1.99",
        "subnet": "10.0.1.0/24",
        "status": "tripped",
        "criticality": "DECEPTION",
        "cves": [],
        "blast_score": 0.0,
    },
]

TOPOLOGY_EDGES: List[Dict[str, Any]] = [
    {
        "source": "node-c2-ext",
        "target": "node-srv-web",
        "protocol": "HTTPS/443",
        "type": "c2_beacon",
        "state": "active_compromise",
        "bandwidth": "1.2 MB/s",
    },
    {
        "source": "node-srv-web",
        "target": "node-srv-app",
        "protocol": "HTTP/8000",
        "type": "lateral_pivot",
        "state": "active_recon",
        "bandwidth": "340 KB/s",
    },
    {
        "source": "node-srv-web",
        "target": "node-ws-dev01",
        "protocol": "SSH/22",
        "type": "lateral_movement",
        "state": "active_compromise",
        "bandwidth": "84 KB/s",
    },
    {
        "source": "node-ws-dev01",
        "target": "node-dc-01",
        "protocol": "SMB/445",
        "type": "pass_the_hash",
        "state": "exploit_attempt",
        "bandwidth": "1.1 MB/s",
    },
    {
        "source": "node-ws-dev01",
        "target": "node-decoy-ssh",
        "protocol": "SSH/2222",
        "type": "canary_tripwire",
        "state": "trapped",
        "bandwidth": "12 KB/s",
    },
    {
        "source": "node-srv-app",
        "target": "node-srv-db",
        "protocol": "PGSQL/5432",
        "type": "authorized_traffic",
        "state": "normal",
        "bandwidth": "4.8 MB/s",
    },
    {
        "source": "node-fw-01",
        "target": "node-srv-web",
        "protocol": "TCP/ANY",
        "type": "inbound_flow",
        "state": "normal",
        "bandwidth": "14.2 MB/s",
    },
]


def build_networkx_graph() -> nx.DiGraph:
    """Build a directed NetworkX graph of current topology."""
    G = nx.DiGraph()
    for n in TOPOLOGY_NODES:
        G.add_node(n["id"], **n)
    for e in TOPOLOGY_EDGES:
        G.add_edge(e["source"], e["target"], **e)
    return G


class BlastRadiusRequest(BaseModel):
    root_node_id: str
    max_hops: int = 3


class QuarantineNodeRequest(BaseModel):
    node_id: str
    reason: str = "Host containment via Topology Radar"


@router.get("/graph")
def get_topology_graph():
    """Return full topology graph nodes, edges, and network density metrics."""
    G = build_networkx_graph()
    density = nx.density(G)
    
    # Calculate degree centrality
    deg_centrality = nx.degree_centrality(G)
    
    # Enhance nodes with dynamic centrality
    enhanced_nodes = []
    for node in TOPOLOGY_NODES:
        n_copy = dict(node)
        n_copy["centrality"] = round(deg_centrality.get(node["id"], 0.0), 3)
        enhanced_nodes.append(n_copy)

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "nodes": enhanced_nodes,
        "edges": TOPOLOGY_EDGES,
        "metrics": {
            "total_nodes": len(TOPOLOGY_NODES),
            "total_edges": len(TOPOLOGY_EDGES),
            "compromised_nodes": len([n for n in TOPOLOGY_NODES if n["status"] == "compromised"]),
            "at_risk_nodes": len([n for n in TOPOLOGY_NODES if n["status"] == "at_risk"]),
            "graph_density": round(density, 4),
            "blast_radius_potential": "HIGH",
        },
    }


@router.post("/blast-radius")
def compute_blast_radius(payload: BlastRadiusRequest):
    """Compute reachability, infected subnets, and blast radius from a root infected node."""
    G = build_networkx_graph()
    if payload.root_node_id not in G:
        raise HTTPException(status_code=404, detail=f"Node {payload.root_node_id} not found")

    # Breadth-first search reachability up to max_hops
    visited = {}
    queue = [(payload.root_node_id, 0)]
    visited[payload.root_node_id] = 0

    while queue:
        curr, depth = queue.pop(0)
        if depth < payload.max_hops:
            for neighbor in G.neighbors(curr):
                if neighbor not in visited:
                    visited[neighbor] = depth + 1
                    queue.append((neighbor, depth + 1))

    reachable_nodes = []
    compromised_subnets = set()
    total_risk_score = 0.0

    for nid, depth in visited.items():
        node_data = next((n for n in TOPOLOGY_NODES if n["id"] == nid), None)
        if node_data:
            reachable_nodes.append({
                "node_id": nid,
                "label": node_data["label"],
                "ip": node_data["ip"],
                "hop_distance": depth,
                "criticality": node_data["criticality"],
                "blast_score": node_data["blast_score"],
            })
            compromised_subnets.add(node_data.get("subnet", "UNKNOWN"))
            total_risk_score += node_data["blast_score"] / (depth + 1)

    avg_blast = round(total_risk_score / max(len(reachable_nodes), 1), 2)

    return {
        "root_node_id": payload.root_node_id,
        "max_hops": payload.max_hops,
        "reachable_node_count": len(reachable_nodes),
        "compromised_subnets": list(compromised_subnets),
        "blast_radius_score": min(avg_blast, 100.0),
        "threat_severity": "CRITICAL" if avg_blast > 70 else "HIGH" if avg_blast > 40 else "MODERATE",
        "propagation_vector": reachable_nodes,
        "recommended_isolation": [n["node_id"] for n in reachable_nodes if n["hop_distance"] <= 1],
    }


@router.post("/isolate/{node_id}")
def isolate_topology_node(node_id: str, payload: Optional[QuarantineNodeRequest] = None):
    """Isolate a node directly from the topology view and prune its edges."""
    node = next((n for n in TOPOLOGY_NODES if n["id"] == node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found in topology")

    node["status"] = "isolated"
    
    # Mark associated edges as blocked
    for e in TOPOLOGY_EDGES:
        if e["source"] == node_id or e["target"] == node_id:
            e["state"] = "zero_trust_blocked"

    return {
        "status": "ISOLATED",
        "node_id": node_id,
        "label": node["label"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "message": f"Node {node['label']} ({node['ip']}) has been severed from all lateral network routes.",
    }
