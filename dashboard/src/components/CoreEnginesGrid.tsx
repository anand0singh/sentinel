"use client";

import React from "react";
import { Cpu, Network, ShieldCheck, Binary, Zap, Terminal } from "lucide-react";

export const CoreEnginesGrid: React.FC = () => {
  const engines = [
    {
      id: "01",
      name: "DEEP PACKET DPI",
      tech: "SURICATA + ZEEK",
      desc: "L3/L4/L7 protocol inspection, ET Open rules, and Community-ID flow hashing.",
      icon: Network,
    },
    {
      id: "02",
      name: "KERNEL eBPF PROBES",
      tech: "TRACEPOINTS / BCC",
      desc: "Zero-overhead syscall intercept on sys_enter_execve and sys_enter_connect.",
      icon: Binary,
    },
    {
      id: "03",
      name: "ISOLATION FOREST ML",
      tech: "SCIKIT-LEARN",
      desc: "Unsupervised volumetric anomaly scoring and low-jitter periodic C2 beaconing detection.",
      icon: Cpu,
    },
    {
      id: "04",
      name: "GRAPH ATTACK CHAIN",
      tech: "NETWORKX MATRIX",
      desc: "Sliding-window entity mapping: Attacker -> Target -> Rogue PID -> Exfiltration.",
      icon: Zap,
    },
    {
      id: "05",
      name: "SOAR CONTAINMENT",
      tech: "IPTABLES / POSIX DROP",
      desc: "Sub-millisecond automated quarantine, IP perimeter blocking, and PID termination.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-6">
        <span className="text-xs font-bold text-acid-lime">/02 CORE DETECTION ENGINES</span>
        <span className="text-[10px] text-muted-gray uppercase tracking-widest">
          PIPELINE: DISTRIBUTED & ISOLATED
        </span>
      </div>

      {/* Grid of 5 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {engines.map((eng) => {
          const Icon = eng.icon;
          return (
            <div
              key={eng.id}
              className="p-4 bg-[#0a0c10] border border-cyber-border hover:border-acid-lime/50 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-black border border-cyber-border text-acid-lime group-hover:border-acid-lime transition">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] text-muted-gray font-bold">/{eng.id}</span>
                </div>
                <h3 className="font-display font-black text-sm text-white tracking-wider mb-1">
                  {eng.name}
                </h3>
                <p className="text-[10px] text-acid-lime font-bold uppercase tracking-wider mb-2">
                  {eng.tech}
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{eng.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-cyber-border text-[9px] text-muted-gray uppercase flex items-center justify-between">
                <span>STATUS:</span>
                <span className="text-acid-lime font-bold">OPERATIONAL</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
