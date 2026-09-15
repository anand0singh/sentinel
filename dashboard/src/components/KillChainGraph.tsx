"use client";

import React from "react";
import { ChevronRight, ShieldAlert, Zap } from "lucide-react";

interface Stage {
  num: string;
  name: string;
  tactic: string;
  technique: string;
  active: boolean;
  desc: string;
}

export const KillChainGraph: React.FC<{ activeStages?: string[] }> = ({
  activeStages = ["RECON", "EXPLOITATION", "EXECUTION", "C2"],
}) => {
  const stages: Stage[] = [
    {
      num: "01",
      name: "RECONNAISSANCE",
      tactic: "DISCOVERY",
      technique: "T1046",
      active: activeStages.includes("RECON"),
      desc: "Port probe & service scanning",
    },
    {
      num: "02",
      name: "INITIAL ACCESS",
      tactic: "EXPLOITATION",
      technique: "T1190",
      active: activeStages.includes("EXPLOITATION"),
      desc: "HTTP / SSH credential breach",
    },
    {
      num: "03",
      name: "EXECUTION",
      tactic: "SHELL SPAWN",
      technique: "T1059.004",
      active: activeStages.includes("EXECUTION"),
      desc: "Interactive /bin/sh reverse shell",
    },
    {
      num: "04",
      name: "COMMAND & CONTROL",
      tactic: "BEACONING",
      technique: "T1071.001",
      active: activeStages.includes("C2"),
      desc: "Low-jitter periodic heartbeat",
    },
    {
      num: "05",
      name: "EXFILTRATION",
      tactic: "EGRESS FLOW",
      technique: "T1048",
      active: activeStages.includes("EXFILTRATION"),
      desc: "Volumetric bulk DNS/HTTPS egress",
    },
  ];

  return (
    <div className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-border mb-6 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-acid-lime">/03 MULTI-STAGE ATTACK-CHAIN CORRELATION</span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-muted-gray">SLIDING WINDOW:</span>
          <span className="text-white font-bold">60 SECONDS</span>
          <span className="text-muted-gray">|</span>
          <span className="text-acid-lime font-bold">GRAPH: NetworkX ACTIVE</span>
        </div>
      </div>

      {/* 5-Stage Kill Chain Progression */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stg, i) => (
          <div
            key={stg.num}
            className={`p-4 border transition-all relative flex flex-col justify-between ${
              stg.active
                ? "border-acid-lime bg-[#0c1004] shadow-acid-sm"
                : "border-cyber-border bg-[#080a0d] opacity-50"
            }`}
          >
            <div>
              {/* Top Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-gray">
                  STAGE /{stg.num}
                </span>
                {stg.active ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-acid-lime text-black animate-pulse">
                    CORRELATED
                  </span>
                ) : (
                  <span className="text-[9px] text-muted-gray uppercase">STANDBY</span>
                )}
              </div>

              {/* Title & Tactic */}
              <h3 className={`text-sm font-display font-black tracking-wider ${stg.active ? "text-white" : "text-gray-400"}`}>
                {stg.name}
              </h3>
              <p className="text-[11px] text-acid-lime-dim mt-0.5 font-bold uppercase">{stg.tactic}</p>
              <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">{stg.desc}</p>
            </div>

            {/* Bottom Technique Tag */}
            <div className="mt-4 pt-2 border-t border-cyber-border flex items-center justify-between">
              <span className={`text-xs font-bold ${stg.active ? "text-acid-lime" : "text-muted-gray"}`}>
                {stg.technique}
              </span>
              {i < stages.length - 1 && (
                <ChevronRight size={14} className="hidden md:block text-muted-gray" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
