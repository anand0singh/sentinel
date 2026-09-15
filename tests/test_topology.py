"""
Tests for Phase 3 Attack Topology & Blast-Radius Engine
"""
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_get_topology_graph():
    response = client.get("/api/v1/topology/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert "metrics" in data
    assert data["metrics"]["total_nodes"] >= 5
    assert len(data["nodes"]) >= 5


def test_compute_blast_radius():
    payload = {
        "root_node_id": "node-srv-web",
        "max_hops": 2
    }
    response = client.post("/api/v1/topology/blast-radius", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["root_node_id"] == "node-srv-web"
    assert "blast_radius_score" in data
    assert len(data["propagation_vector"]) > 0


def test_isolate_topology_node():
    response = client.post("/api/v1/topology/isolate/node-ws-dev01")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ISOLATED"
    assert data["node_id"] == "node-ws-dev01"
