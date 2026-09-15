"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Shield, Terminal, Zap, Network, Radio, AlertTriangle, Lock, RefreshCw } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface TopologyNode {
  id: string;
  label: string;
  type: string;
  ip: string;
  subnet: string;
  status: string;
  criticality: string;
  cves: string[];
  blast_score: number;
  centrality?: number;
  compromise_reason?: string;
}

interface TopologyEdge {
  source: string;
  target: string;
  protocol: string;
  type: string;
  state: string;
  bandwidth: string;
}

export default function TopologyPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [edges, setEdges] = useState<TopologyEdge[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total_nodes: 8,
    total_edges: 7,
    compromised_nodes: 2,
    at_risk_nodes: 2,
    graph_density: 0.25,
    blast_radius_potential: "CRITICAL",
  });
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [blastData, setBlastData] = useState<any>(null);
  const [isCalculatingBlast, setIsCalculatingBlast] = useState(false);
  const [isolationFeedback, setIsolationFeedback] = useState<string | null>(null);

  // Fetch topology graph
  const loadTopology = () => {
    fetch("http://localhost:8000/api/v1/topology/graph")
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setMetrics(data.metrics || {});
        if (data.nodes && data.nodes.length > 0 && !selectedNode) {
          setSelectedNode(data.nodes[1]); // Default to compromised DMZ server
        }
      })
      .catch(() => {
        // Fallback default node
        setNodes([
          {
            id: "node-srv-web",
            label: "DMZ-NGINX-EDGE",
            type: "server",
            ip: "10.0.0.50",
            subnet: "10.0.0.0/24",
            status: "compromised",
            criticality: "CRITICAL",
            cves: ["CVE-2024-21413"],
            blast_score: 88.4,
            centrality: 0.428,
            compromise_reason: "Initial Access Pivot",
          },
        ]);
      });
  };

  useEffect(() => {
    loadTopology();
  }, []);

  // Compute blast radius
  const handleComputeBlastRadius = (nodeId: string) => {
    setIsCalculatingBlast(true);
    fetch("http://localhost:8000/api/v1/topology/blast-radius", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ root_node_id: nodeId, max_hops: 2 }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBlastData(data);
        setIsCalculatingBlast(false);
      })
      .catch(() => {
        setIsCalculatingBlast(false);
      });
  };

  // Isolate node
  const handleIsolateNode = (nodeId: string) => {
    fetch(`http://localhost:8000/api/v1/topology/isolate/${nodeId}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsolationFeedback(`NODE ${data.label} SEVERED FROM LATERAL ROUTES`);
        loadTopology();
        setTimeout(() => setIsolationFeedback(null), 4000);
      })
      .catch(() => {
        setIsolationFeedback(`FAILED TO ISOLATE ${nodeId}`);
      });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4ff00] font-mono selection:bg-[#d4ff00] selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Matrix Crosshairs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Brutalist Navigation Bar */}
      <BrutalistHeader onOpenSimModal={() => setIsSimModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-grow z-10 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[#d4ff00] pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest text-[#888] mb-2 uppercase">
              <Link href="/" className="hover:text-[#d4ff00] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> COMMAND_HUD
              </Link>
              <span>/</span>
              <span className="text-[#d4ff00]">PHASE_03</span>
              <span>/</span>
              <span>ATTACK_TOPOLOGY_RADAR</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <Network className="w-8 h-8 md:w-12 md:h-12 text-[#d4ff00]" />
              TOPOLOGY_RADAR // LATERAL_MAP
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadTopology}
              className="border-2 border-[#d4ff00] bg-black text-[#d4ff00] hover:bg-[#d4ff00] hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> REFRESH_GRAPH
            </button>
            <div className="text-right">
              <span className="text-[10px] text-[#888] tracking-widest block uppercase">ENGINE_STATE</span>
              <span className="text-xs bg-[#d4ff00] text-black px-2 py-0.5 font-bold uppercase tracking-wider">
                NETWORKX_ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {isolationFeedback && (
          <div className="bg-[#ff003c] text-black font-bold p-3 text-xs uppercase tracking-widest flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{isolationFeedback}</span>
            </div>
            <span>ZERO_TRUST_ENFORCED</span>
          </div>
        )}

        {/* Scorecard Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="border border-[#222] bg-[#0a0a0a] p-3">
            <span className="text-[10px] text-[#666] tracking-widest block uppercase">TOTAL_NODES</span>
            <span className="text-xl font-bold text-white">{metrics.total_nodes || nodes.length}</span>
          </div>
          <div className="border border-[#222] bg-[#0a0a0a] p-3">
            <span className="text-[10px] text-[#666] tracking-widest block uppercase">ACTIVE_EDGES</span>
            <span className="text-xl font-bold text-white">{metrics.total_edges || edges.length}</span>
          </div>
          <div className="border border-[#ff003c]/30 bg-[#ff003c]/10 p-3">
            <span className="text-[10px] text-[#ff003c] tracking-widest block uppercase">COMPROMISED</span>
            <span className="text-xl font-bold text-[#ff003c]">{metrics.compromised_nodes || 2}</span>
          </div>
          <div className="border border-[#ffb700]/30 bg-[#ffb700]/10 p-3">
            <span className="text-[10px] text-[#ffb700] tracking-widest block uppercase">AT_RISK_HOPS</span>
            <span className="text-xl font-bold text-[#ffb700]">{metrics.at_risk_nodes || 2}</span>
          </div>
          <div className="border border-[#222] bg-[#0a0a0a] p-3">
            <span className="text-[10px] text-[#666] tracking-widest block uppercase">GRAPH_DENSITY</span>
            <span className="text-xl font-bold text-[#d4ff00]">{metrics.graph_density || "0.25"}</span>
          </div>
          <div className="border border-[#d4ff00] bg-[#d4ff00]/10 p-3">
            <span className="text-[10px] text-[#d4ff00] tracking-widest block uppercase">BLAST_SEVERITY</span>
            <span className="text-xl font-bold text-white">{metrics.blast_radius_potential || "CRITICAL"}</span>
          </div>
        </div>

        {/* Main Grid: Interactive Canvas Radar & Node Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topology Interactive Canvas / Node Graph Display (2 cols) */}
          <div className="lg:col-span-2 border-2 border-[#222] bg-[#080808] p-4 flex flex-col justify-between relative min-h-[520px]">
            <div className="flex justify-between items-center border-b border-[#222] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#d4ff00] animate-pulse" />
                <span className="text-xs tracking-widest text-white uppercase font-bold">
                  ACTIVE_ATTACK_SURFACE_RADAR // NODE_TOPOLOGY
                </span>
              </div>
              <span className="text-[10px] text-[#666] uppercase tracking-widest">
                HOPS_ANALYSIS: BFS_DEPTH_03
              </span>
            </div>

            {/* Interactive Node Grid Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isCompromised = node.status === "compromised" || node.status === "malicious";
                const isAtRisk = node.status === "at_risk";
                const isIsolated = node.status === "isolated";
                const isHoneypot = node.type === "honeypot";

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 border-2 cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? "border-[#d4ff00] bg-[#111] shadow-[0_0_15px_rgba(212,255,0,0.2)]"
                        : isCompromised
                        ? "border-[#ff003c] bg-[#ff003c]/5 hover:bg-[#ff003c]/10"
                        : isAtRisk
                        ? "border-[#ffb700] bg-[#ffb700]/5 hover:bg-[#ffb700]/10"
                        : isIsolated
                        ? "border-[#555] bg-[#1a1a1a] opacity-60"
                        : isHoneypot
                        ? "border-[#00ffff] bg-[#00ffff]/5 hover:bg-[#00ffff]/10"
                        : "border-[#222] bg-[#0c0c0c] hover:border-[#444]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompromised
                              ? "bg-[#ff003c] animate-ping"
                              : isAtRisk
                              ? "bg-[#ffb700]"
                              : isIsolated
                              ? "bg-[#555]"
                              : isHoneypot
                              ? "bg-[#00ffff] animate-pulse"
                              : "bg-[#d4ff00]"
                          }`}
                        />
                        {node.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                          isCompromised
                            ? "bg-[#ff003c] text-black"
                            : isAtRisk
                            ? "bg-[#ffb700] text-black"
                            : isIsolated
                            ? "bg-[#555] text-white"
                            : isHoneypot
                            ? "bg-[#00ffff] text-black"
                            : "bg-[#222] text-[#888]"
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#888] flex justify-between font-mono">
                      <span>IP: {node.ip}</span>
                      <span>{node.subnet}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#1a1a1a] flex justify-between items-center text-[10px]">
                      <span className="text-[#666] uppercase">BLAST_SCORE</span>
                      <span
                        className={`font-bold ${
                          node.blast_score > 70
                            ? "text-[#ff003c]"
                            : node.blast_score > 40
                            ? "text-[#ffb700]"
                            : "text-[#d4ff00]"
                        }`}
                      >
                        {node.blast_score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edge Connection Route List */}
            <div className="border-t border-[#222] pt-3">
              <span className="text-[10px] text-[#888] uppercase tracking-widest block mb-2 font-bold">
                DETECTED_LATERAL_HOPS // TRAFFIC_STREAM
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {edges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] flex justify-between items-center bg-[#0d0d0d] px-2 py-1 border border-[#1a1a1a]"
                  >
                    <span className="text-white font-mono flex items-center gap-1.5">
                      <span className="text-[#d4ff00] font-bold">&gt;</span>
                      <span className="text-[#888]">{edge.source}</span>
                      <span className="text-[#d4ff00]">&rarr;</span>
                      <span className="text-white font-bold">{edge.target}</span>
                      <span className="text-[#666]">({edge.protocol})</span>
                    </span>
                    <span
                      className={`text-[9px] px-1 font-bold uppercase ${
                        edge.type === "pass_the_hash" || edge.type === "c2_beacon"
                          ? "text-[#ff003c]"
                          : edge.type === "lateral_movement" || edge.type === "lateral_pivot"
                          ? "text-[#ffb700]"
                          : edge.type === "canary_tripwire"
                          ? "text-[#00ffff]"
                          : "text-[#666]"
                      }`}
                    >
                      {edge.type} [{edge.bandwidth}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Node Inspector & Blast Radius Analyzer (1 col) */}
          <div className="border-2 border-[#222] bg-[#0c0c0c] p-4 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-[#222] pb-3">
                  <span className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">
                    TARGET_NODE_INSPECTOR
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedNode.label}</h3>
                  <span className="text-xs text-[#d4ff00] font-mono">{selectedNode.ip}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">SUBNET_ZONE</span>
                    <span className="text-white font-bold">{selectedNode.subnet}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">CRITICALITY</span>
                    <span className="text-[#d4ff00] font-bold">{selectedNode.criticality}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">CENTRALITY</span>
                    <span className="text-white font-mono">{selectedNode.centrality ?? 0.35}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">RISK_POTENTIAL</span>
                    <span className="text-[#ff003c] font-bold">{selectedNode.blast_score}%</span>
                  </div>
                  {selectedNode.compromise_reason && (
                    <div className="py-1 border-b border-[#1a1a1a]">
                      <span className="text-[#666] uppercase block mb-0.5">COMPROMISE_VECTOR</span>
                      <span className="text-[#ff003c] text-[11px]">{selectedNode.compromise_reason}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#666] uppercase block mb-1">ASSOCIATED_CVES</span>
                    {selectedNode.cves.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.cves.map((cve) => (
                          <span
                            key={cve}
                            className="bg-[#222] text-[#d4ff00] text-[10px] px-1.5 py-0.5 border border-[#333]"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#666] text-[11px]">NO ACTIVE EXPLOIT CVE</span>
                    )}
                  </div>
                </div>

                {/* Blast Radius Calculation Output */}
                {blastData && blastData.root_node_id === selectedNode.id && (
                  <div className="border border-[#ff003c]/40 bg-[#ff003c]/5 p-3 space-y-2 mt-4">
                    <span className="text-[10px] text-[#ff003c] font-bold tracking-widest uppercase block">
                      BLAST_RADIUS // SIMULATION_RESULT
                    </span>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888]">REACHABLE_HOSTS:</span>
                      <span className="text-white font-bold">{blastData.reachable_node_count} nodes</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888]">IMPACTED_SUBNETS:</span>
                      <span className="text-white font-bold">{blastData.compromised_subnets.join(", ")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888]">PROPAGATION_SCORE:</span>
                      <span className="text-[#ff003c] font-bold">{blastData.blast_radius_score}%</span>
                    </div>
                  </div>
                )}

                {/* Action Triggers */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleComputeBlastRadius(selectedNode.id)}
                    disabled={isCalculatingBlast}
                    className="w-full bg-[#151515] border border-[#d4ff00] text-[#d4ff00] hover:bg-[#d4ff00] hover:text-black py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    {isCalculatingBlast ? "CALCULATING..." : "COMPUTE_BLAST_RADIUS"}
                  </button>

                  <button
                    onClick={() => handleIsolateNode(selectedNode.id)}
                    className="w-full bg-[#ff003c] text-black hover:bg-white py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> ZERO_TRUST_ISOLATE_HOST
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#666] uppercase">
                SELECT A NODE ON THE RADAR TO INSPECT
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Brutalist Hazard Footer */}
      <HazardFooter />

      {/* Attack Simulation Modal */}
      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onLaunchSuccess={loadTopology}
      />
    </div>
  );
}
