"use client";

import React from "react";
import { ShieldAlert, Activity, Server, Radio } from "lucide-react";

interface MetricProps {
  activeAlerts: number;
  criticalChains: number;
  eventsProcessed: number;
  quarantinedHosts: number;
}

export const MetricCards: React.FC<MetricProps> = ({
  activeAlerts,
  criticalChains,
  eventsProcessed,
  quarantinedHosts,
}) => {
  const cards = [
    {
      idx: "01",
      title: "ACTIVE ALERTS",
      value: activeAlerts,
      unit: "INCIDENTS",
      color: "text-hazard-amber",
      borderColor: "border-cyber-border",
      sub: "SURICATA / EBPF",
    },
    {
      idx: "02",
      title: "KILL-CHAIN CHAINS",
      value: criticalChains,
      unit: "CAMPAIGNS",
      color: "text-alert-red",
      borderColor: "border-alert-red/40",
      sub: "MULTI-STAGE ATTACKS",
    },
    {
      idx: "03",
      title: "NORMALIZED TELEMETRY",
      value: eventsProcessed.toLocaleString(),
      unit: "EVENTS / SEC",
      color: "text-acid-lime",
      borderColor: "border-cyber-border",
      sub: "VECTOR + KAFKA ECS",
    },
    {
      idx: "04",
      title: "QUARANTINED TARGETS",
      value: quarantinedHosts,
      unit: "ISOLATED",
      color: "text-radar-cyan",
      borderColor: "border-cyber-border",
      sub: "ACTIVE SOAR ACTIONS",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.idx}
          className={`p-5 bg-[#050505] border ${card.borderColor} relative font-mono shadow-dark-block hover:border-acid-lime/50 transition`}
        >
          {/* Top Index */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-gray uppercase tracking-widest">
              METRIC /{card.idx}
            </span>
            <span className="text-[9px] text-muted-gray uppercase font-semibold">{card.sub}</span>
          </div>

          {/* Metric Value */}
          <div className={`text-4xl font-display font-black tracking-tight ${card.color} my-1`}>
            {card.value}
          </div>

          {/* Title & Unit */}
          <div className="flex items-center justify-between text-xs text-muted-gray pt-2 border-t border-cyber-border">
            <span className="font-bold text-gray-200">{card.title}</span>
            <span className="text-[10px] text-acid-lime-dim">{card.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
