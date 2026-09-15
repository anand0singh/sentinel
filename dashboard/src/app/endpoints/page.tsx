"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Server, Shield, Terminal, Zap, Radio, Lock, Skull, Cpu, RefreshCw, AlertTriangle } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface EndpointNode {
  id: string;
  hostname: string;
  os: string;
  ip: string;
  agent_version: string;
  status: string;
  ebpf_probes_attached: number;
  probes_status: string;
  cpu_usage: string;
  mem_usage: string;
  last_seen: string;
  compromised: boolean;
}

interface EbpfEvent {
  timestamp: string;
  probe: string;
  pid: number;
  uid: number;
  comm: string;
  args: string;
  verdict: string;
  severity: string;
}

export default function EndpointsPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [endpoints, setEndpoints] = useState<EndpointNode[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointNode | null>(null);
  const [probes, setProbes] = useState<EbpfEvent[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Fetch endpoints
  const loadFleet = () => {
    fetch("http://localhost:8000/api/v1/endpoints")
      .then((res) => res.json())
      .then((data) => {
        setEndpoints(data.endpoints || []);
        if (data.endpoints && data.endpoints.length > 0 && !selectedEndpoint) {
          setSelectedEndpoint(data.endpoints[0]);
          loadProbes(data.endpoints[0].id);
        }
      })
      .catch(() => {});
  };

  const loadProbes = (endpointId: string) => {
    fetch(`http://localhost:8000/api/v1/endpoints/${endpointId}/probes`)
      .then((res) => res.json())
      .then((data) => {
        setProbes(data.events || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleSelectEndpoint = (ep: EndpointNode) => {
    setSelectedEndpoint(ep);
    loadProbes(ep.id);
  };

  const handleExecuteAction = (action: string) => {
    if (!selectedEndpoint) return;
    fetch(`http://localhost:8000/api/v1/endpoints/${selectedEndpoint.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: "Manual SOC command dispatch" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setActionFeedback(data.message);
        loadFleet();
        setTimeout(() => setActionFeedback(null), 4000);
      })
      .catch(() => {
        setActionFeedback("Action failed to dispatch.");
      });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4ff00] font-mono selection:bg-[#d4ff00] selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <BrutalistHeader onOpenSimModal={() => setIsSimModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-grow z-10 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[#d4ff00] pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest text-[#888] mb-2 uppercase">
              <Link href="/" className="hover:text-[#d4ff00] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> COMMAND_HUD
              </Link>
              <span>/</span>
              <span className="text-[#d4ff00]">PHASE_03</span>
              <span>/</span>
              <span>ENDPOINT_FLEET_MATRIX</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <Server className="w-8 h-8 md:w-12 md:h-12 text-[#d4ff00]" />
              FLEET_MATRIX // eBPF_PROBES
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadFleet}
              className="border border-[#d4ff00] bg-black text-[#d4ff00] hover:bg-[#d4ff00] hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> REFRESH_FLEET
            </button>
            <span className="text-xs bg-[#d4ff00] text-black px-2.5 py-1 font-bold uppercase tracking-wider">
              AGENT_MESH: ACTIVE
            </span>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-[#d4ff00] text-black font-bold p-3 text-xs uppercase tracking-widest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{actionFeedback}</span>
            </div>
            <span>ACTION_ACKNOWLEDGED</span>
          </div>
        )}

        {/* Main Grid: Fleet Table (Left 2 cols) & Host Detail/Actions (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fleet Table */}
          <div className="lg:col-span-2 border-2 border-[#222] bg-[#0c0c0c] p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                MONITORED_FLEET_HOSTS ({endpoints.length})
              </span>
              <span className="text-[10px] text-[#888] uppercase">KERNEL_LEVEL_TELEMETRY</span>
            </div>

            <div className="space-y-2">
              {endpoints.map((ep) => {
                const isSelected = selectedEndpoint?.id === ep.id;
                const isCompromised = ep.compromised || ep.status === "COMPROMISED";
                const isIsolated = ep.status === "ISOLATED";

                return (
                  <div
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`p-3 border cursor-pointer transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                      isSelected
                        ? "border-[#d4ff00] bg-[#141414]"
                        : isCompromised
                        ? "border-[#ff003c]/40 bg-[#ff003c]/5 hover:bg-[#ff003c]/10"
                        : isIsolated
                        ? "border-[#555] bg-[#1a1a1a] opacity-60"
                        : "border-[#222] bg-[#090909] hover:border-[#333]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompromised
                              ? "bg-[#ff003c] animate-ping"
                              : isIsolated
                              ? "bg-[#555]"
                              : "bg-[#d4ff00]"
                          }`}
                        />
                        <span className="text-white font-bold text-sm tracking-wider">{ep.hostname}</span>
                        <span className="text-[10px] text-[#888]">({ep.ip})</span>
                      </div>
                      <div className="text-[11px] text-[#666] font-mono">{ep.os}</div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-[#666] block uppercase">PROBES</span>
                        <span className="text-[#d4ff00] font-bold">{ep.ebpf_probes_attached} HOOKS</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#666] block uppercase">LOAD</span>
                        <span className="text-white">{ep.cpu_usage}</span>
                      </div>
                      <div>
                        <span
                          className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                            isCompromised
                              ? "bg-[#ff003c] text-black"
                              : isIsolated
                              ? "bg-[#555] text-white"
                              : "bg-[#222] text-[#d4ff00]"
                          }`}
                        >
                          {ep.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Host eBPF Probe Live Stream */}
            {selectedEndpoint && (
              <div className="border-t border-[#222] pt-4 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-[#d4ff00] animate-pulse" />
                    eBPF_KERNEL_SYSCALL_STREAM // {selectedEndpoint.hostname}
                  </span>
                  <span className="text-[10px] text-[#666] uppercase">RING_BUFFER_STREAM</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
                  {probes.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-[#090909] border border-[#1a1a1a] p-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#d4ff00] font-bold">{p.probe}</span>
                          <span className="text-[10px] text-[#888]">
                            PID:{p.pid} (UID:{p.uid}) [{p.comm}]
                          </span>
                        </div>
                        <div className="text-[11px] text-[#ccc] truncate max-w-xl">{p.args}</div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                          p.severity === "CRITICAL"
                            ? "bg-[#ff003c] text-black"
                            : p.severity === "HIGH"
                            ? "bg-[#ffb700] text-black"
                            : "bg-[#222] text-[#888]"
                        }`}
                      >
                        {p.verdict}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Host Inspector & Edge Action Panel */}
          <div className="border-2 border-[#222] bg-[#0c0c0c] p-4 flex flex-col justify-between space-y-6">
            {selectedEndpoint ? (
              <div className="space-y-4">
                <div className="border-b border-[#222] pb-3">
                  <span className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">
                    TARGET_HOST_VITALS
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedEndpoint.hostname}</h3>
                  <span className="text-xs text-[#d4ff00] font-mono">{selectedEndpoint.ip}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">AGENT_VERSION</span>
                    <span className="text-white font-mono">{selectedEndpoint.agent_version}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">PROBES_STATUS</span>
                    <span className="text-[#d4ff00] font-bold">{selectedEndpoint.probes_status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">CPU_SATURATION</span>
                    <span className="text-white font-mono">{selectedEndpoint.cpu_usage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">MEM_SATURATION</span>
                    <span className="text-white font-mono">{selectedEndpoint.mem_usage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                    <span className="text-[#666] uppercase">LAST_BEAT</span>
                    <span className="text-[#888]">{selectedEndpoint.last_seen}</span>
                  </div>
                </div>

                {/* Edge Containment Actions */}
                <div className="space-y-2 pt-4">
                  <span className="text-[10px] text-[#ff003c] font-bold uppercase tracking-wider block">
                    EDGE_REMEDIATION_COMMANDS
                  </span>

                  <button
                    onClick={() => handleExecuteAction("isolate")}
                    className="w-full bg-[#ff003c] text-black hover:bg-white py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> SEVER_HOST_FIREWALL
                  </button>

                  <button
                    onClick={() => handleExecuteAction("terminate_process")}
                    className="w-full bg-[#151515] border border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-black py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Skull className="w-3.5 h-3.5" /> SIGKILL_ANOMALOUS_PIDS
                  </button>

                  <button
                    onClick={() => handleExecuteAction("dump_memory")}
                    className="w-full bg-[#151515] border border-[#d4ff00] text-[#d4ff00] hover:bg-[#d4ff00] hover:text-black py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5" /> DUMP_RAM_FOR_FORENSICS
                  </button>

                  <button
                    onClick={() => handleExecuteAction("restart_probe")}
                    className="w-full bg-[#151515] border border-[#444] text-[#888] hover:bg-[#222] hover:text-white py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> RE-HOOK_EBPF_PROBES
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-[#666] uppercase">SELECT HOST TO INSPECT</div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <HazardFooter />

      {/* Attack Simulation Modal */}
      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onLaunchSuccess={loadFleet}
      />
    </div>
  );
}
