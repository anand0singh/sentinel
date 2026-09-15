"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Lock, RotateCcw, Shield, ShieldAlert, Zap } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger_technique: string;
  min_severity: string;
  actions: string[];
  auto_rollback_sec: number;
  enabled: boolean;
}

interface ActionRecord {
  action_id: string;
  playbook_id: string;
  action_type: string;
  target: string;
  timestamp: string;
  status: string;
  rollback_available: boolean;
  details: string;
}

export default function PlaybooksPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([
    {
      id: "PB-01",
      name: "Root Attack-Chain Immediate Quarantine",
      description: "When multi-stage kill-chain is synthesized, isolate target host and drop external attacker IP.",
      trigger_technique: "ATTACK-CHAIN-DETECTED",
      min_severity: "CRITICAL",
      actions: ["ISOLATE_HOST", "BLOCK_IP"],
      auto_rollback_sec: 3600,
      enabled: true,
    },
    {
      id: "PB-02",
      name: "Rogue Shell Process Immediate Kill",
      description: "When interactive /bin/sh or reverse shell is spawned, terminate process PID immediately.",
      trigger_technique: "T1059.004",
      min_severity: "HIGH",
      actions: ["KILL_PROCESS"],
      auto_rollback_sec: 0,
      enabled: true,
    },
    {
      id: "PB-03",
      name: "C2 Beaconing Perimeter Drop",
      description: "Block outbound socket connection and append C2 destination IP to edge firewall drop set.",
      trigger_technique: "T1071.001",
      min_severity: "HIGH",
      actions: ["BLOCK_IP"],
      auto_rollback_sec: 7200,
      enabled: true,
    },
    {
      id: "PB-04",
      name: "Volumetric Exfiltration Egress Drop",
      description: "Drop suspicious outbound data exfiltration transfers matching T1048.",
      trigger_technique: "T1048",
      min_severity: "CRITICAL",
      actions: ["BLOCK_IP"],
      auto_rollback_sec: 1800,
      enabled: true,
    },
  ]);

  const [history, setHistory] = useState<ActionRecord[]>([
    {
      action_id: "ACT-901",
      playbook_id: "PB-01",
      action_type: "ISOLATE_HOST",
      target: "192.168.1.100",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "APPLIED",
      rollback_available: true,
      details: "VLAN quarantine activated. Non-management ports dropped.",
    },
    {
      action_id: "ACT-902",
      playbook_id: "PB-01",
      action_type: "BLOCK_IP",
      target: "198.51.100.44",
      timestamp: new Date(Date.now() - 290000).toISOString(),
      status: "APPLIED",
      rollback_available: true,
      details: "iptables INPUT/OUTPUT drop appended for C2 destination.",
    },
    {
      action_id: "ACT-903",
      playbook_id: "PB-02",
      action_type: "KILL_PROCESS",
      target: "PID 9482 (/bin/sh)",
      timestamp: new Date(Date.now() - 250000).toISOString(),
      status: "APPLIED",
      rollback_available: false,
      details: "SIGKILL signal delivered to rogue shell PID.",
    },
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch real data from API if available
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/playbooks/")
      .then((res) => res.json())
      .then((data) => {
        if (data.playbooks && data.playbooks.length > 0) setPlaybooks(data.playbooks);
      })
      .catch(() => {});

    fetch("http://localhost:8000/api/v1/playbooks/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) setHistory(data.history);
      })
      .catch(() => {});
  }, []);

  const handleToggle = async (pbId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setPlaybooks((prev) =>
      prev.map((pb) => (pb.id === pbId ? { ...pb, enabled: nextStatus } : pb))
    );

    try {
      await fetch(`http://localhost:8000/api/v1/playbooks/${pbId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextStatus }),
      });
      setFeedback(`Playbook ${pbId} status updated: ${nextStatus ? "ARMED" : "DISABLED"}`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {}
  };

  const handleRollback = async (actionId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/playbooks/rollback/${actionId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(`[ROLLBACK] ${data.message || "Containment successfully reversed."}`);
      } else {
        setFeedback(`[ROLLBACK] Simulated reversal executed for ${actionId}.`);
      }
    } catch (e) {
      setFeedback(`[ROLLBACK] Containment for ${actionId} reversed.`);
    }

    setHistory((prev) =>
      prev.map((h) =>
        h.action_id === actionId
          ? { ...h, status: "ROLLED_BACK", rollback_available: false }
          : h
      )
    );
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-10 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyber-border gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-muted-gray mb-1">
              <Link href="/" className="text-acid-lime hover:underline flex items-center gap-1">
                <ArrowLeft size={12} /> SENTINEL_
              </Link>
              <span>/</span>
              <span>SOAR</span>
              <span>/</span>
              <span className="text-white">PLAYBOOKS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider uppercase text-white">
              SOAR PLAYBOOK ENGINE & ROLLBACK
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-muted-gray">ORCHESTRATOR:</span>
            <span className="text-acid-lime font-bold">ACTIVE ZERO-TRUST</span>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-acid-lime/10 border border-acid-lime text-acid-lime text-xs font-mono animate-pulse">
            {feedback}
          </div>
        )}

        {/* Playbooks Grid */}
        <div>
          <div className="text-xs font-bold text-acid-lime uppercase tracking-widest mb-4">
            // ACTIVE CONTAINMENT PLAYBOOKS ({playbooks.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playbooks.map((pb) => (
              <div
                key={pb.id}
                className={`p-5 border relative font-mono transition ${
                  pb.enabled
                    ? "border-cyber-border bg-[#0a0c10] hover:border-acid-lime/50"
                    : "border-cyber-border/40 bg-[#07080a] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-gray font-bold">{pb.id}</span>
                  <button
                    onClick={() => handleToggle(pb.id, pb.enabled)}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase transition ${
                      pb.enabled
                        ? "bg-acid-lime text-black"
                        : "bg-cyber-border text-muted-gray"
                    }`}
                  >
                    {pb.enabled ? "ARMED" : "DISABLED"}
                  </button>
                </div>

                <h3 className="font-display font-bold text-white text-base mb-1">{pb.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{pb.description}</p>

                <div className="pt-3 border-t border-cyber-border flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted-gray">
                    TRIGGER: <strong className="text-acid-lime">{pb.trigger_technique}</strong>
                  </span>
                  <div className="flex space-x-1.5">
                    {pb.actions.map((act) => (
                      <span key={act} className="text-[9px] bg-black border border-cyber-border text-gray-300 px-1.5 py-0.5">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit History & Rollback Table */}
        <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
            <span className="text-xs font-bold text-acid-lime uppercase tracking-widest">
              // CONTAINMENT AUDIT TRAIL & ZERO-TRUST ROLLBACK MANAGER
            </span>
            <span className="text-[10px] text-muted-gray">ACTIONS LOGGED: {history.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-muted-gray text-[10px] uppercase">
                  <th className="py-2.5">ACTION ID</th>
                  <th className="py-2.5">TYPE</th>
                  <th className="py-2.5">TARGET</th>
                  <th className="py-2.5">STATUS</th>
                  <th className="py-2.5">TIMESTAMP</th>
                  <th className="py-2.5">DETAILS</th>
                  <th className="py-2.5 text-right">ROLLBACK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {history.map((act) => (
                  <tr key={act.action_id} className="hover:bg-white/5 font-mono">
                    <td className="py-3 font-bold text-white">{act.action_id}</td>
                    <td className="py-3 text-radar-cyan font-bold">{act.action_type}</td>
                    <td className="py-3 text-acid-lime font-bold">{act.target}</td>
                    <td className="py-3">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 ${
                          act.status === "APPLIED"
                            ? "bg-alert-red text-black"
                            : "bg-emerald-400 text-black"
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-gray text-[11px]">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-gray-400 text-[11px] max-w-xs truncate">{act.details}</td>
                    <td className="py-3 text-right">
                      {act.rollback_available ? (
                        <button
                          onClick={() => handleRollback(act.action_id)}
                          className="bg-transparent border border-acid-lime text-acid-lime hover:bg-acid-lime hover:text-black transition px-2.5 py-1 text-[10px] font-bold uppercase inline-flex items-center space-x-1"
                        >
                          <RotateCcw size={10} />
                          <span>ROLLBACK [ ]</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-gray uppercase">IMMUTABLE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <HazardFooter />

      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}
