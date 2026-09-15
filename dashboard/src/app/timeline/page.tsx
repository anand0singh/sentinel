"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitCommit, ShieldAlert, ArrowRight, Activity, Terminal } from "lucide-react";
import { BrutalistHeader } from "@/components/BrutalistHeader";
import { KillChainGraph } from "@/components/KillChainGraph";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

export default function TimelinePage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const attackEvents = [
    {
      time: "T + 0.0s",
      stage: "RECONNAISSANCE",
      mitre: "T1046",
      title: "Target Port Scanning & Service Discovery",
      actor: "198.51.100.44",
      target: "192.168.1.100:80/22",
      engine: "SURICATA",
      status: "LOGGED",
    },
    {
      time: "T + 2.4s",
      stage: "INITIAL ACCESS",
      mitre: "T1190",
      title: "Exploit Execution on Vulnerable HTTP Endpoint",
      actor: "198.51.100.44",
      target: "192.168.1.100:80",
      engine: "SURICATA DPI",
      status: "FLAGGED",
    },
    {
      time: "T + 3.1s",
      stage: "EXECUTION",
      mitre: "T1059.004",
      title: "Kernel Hook Caught /bin/sh Reverse Shell Spawn",
      actor: "PID 9482 (/bin/sh)",
      target: "198.51.100.44:4444",
      engine: "EBPF PROBE",
      status: "CRITICAL",
    },
    {
      time: "T + 5.8s",
      stage: "COMMAND & CONTROL",
      mitre: "T1071.001",
      title: "Low-Jitter C2 Beaconing Channel Established",
      actor: "192.168.1.100",
      target: "198.51.100.44:443",
      engine: "ISOLATION FOREST",
      status: "CORRELATED",
    },
    {
      time: "T + 6.2s",
      stage: "ROOT SYNTHESIS",
      mitre: "ATTACK-CHAIN-DETECTED",
      title: "Multi-Stage Attack Chain Synthesized by NetworkX",
      actor: "CAMPAIGN #891",
      target: "192.168.1.100",
      engine: "GRAPH CORRELATOR",
      status: "SOAR TRIGGERED",
    },
    {
      time: "T + 6.4s",
      stage: "CONTAINMENT",
      mitre: "SOAR-ISOLATE",
      title: "Host Isolated & Inbound Dropped via iptables",
      actor: "SENTINEL SOAR",
      target: "192.168.1.100",
      engine: "AUTO-QUARANTINE",
      status: "RESOLVED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8 flex-1">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyber-border gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-muted-gray mb-1">
              <Link href="/" className="text-acid-lime hover:underline flex items-center gap-1">
                <ArrowLeft size={12} /> SENTINEL_
              </Link>
              <span>/</span>
              <span>CORRELATION</span>
              <span>/</span>
              <span className="text-white">TIMELINE</span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-wider uppercase text-white">
              ATTACK CHAIN PROGRESSION MATRIX
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-gray">SLIDING WINDOW:</span>
            <span className="text-acid-lime font-bold">60 SECONDS</span>
          </div>
        </div>

        {/* 5-Stage Visual Progression */}
        <KillChainGraph activeStages={["RECON", "EXPLOITATION", "EXECUTION", "C2"]} />

        {/* Chronological Event Progression */}
        <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner">
          <h3 className="text-xs font-bold text-acid-lime uppercase tracking-widest mb-6 pb-3 border-b border-cyber-border">
            // CHRONOLOGICAL INCIDENT TRACE
          </h3>

          <div className="space-y-4">
            {attackEvents.map((ev, i) => (
              <div
                key={i}
                className="p-4 bg-[#0a0c10] border border-cyber-border hover:border-acid-lime/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <span className="px-2 py-0.5 bg-black border border-cyber-border text-acid-lime font-bold text-[11px]">
                    {ev.time}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-muted-gray font-bold uppercase">{ev.stage}</span>
                      <span className="text-[10px] text-acid-lime font-mono">[{ev.mitre}]</span>
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mt-0.5">{ev.title}</h4>
                    <div className="text-[11px] text-muted-gray mt-1">
                      ACTOR: <span className="text-gray-300">{ev.actor}</span> &rarr; TARGET: <span className="text-gray-300">{ev.target}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="text-[10px] text-muted-gray border border-cyber-border px-2 py-1">
                    {ev.engine}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-1 ${
                      ev.status.includes("CRITICAL") || ev.status.includes("SOAR")
                        ? "bg-alert-red text-black"
                        : "bg-acid-lime text-black"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
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
