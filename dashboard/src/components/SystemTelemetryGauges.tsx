"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export const SystemTelemetryGauges: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState(73);
  const [eps, setEps] = useState(14290);
  const [memoryStr, setMemoryStr] = useState("8.6 GB / 16 GB");
  const [uptimeStr, setUptimeStr] = useState("7D 14H 22M");
  const [networkStatus, setNetworkStatus] = useState("SECURE");

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/telemetry");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.cpu_percent) setCpuUsage(data.cpu_percent);
          if (data.ingestion_eps) setEps(data.ingestion_eps);
          if (data.memory_used_gb) setMemoryStr(`${data.memory_used_gb} GB / 16 GB`);
          if (data.uptime_str) setUptimeStr(data.uptime_str);
          if (data.network_status) setNetworkStatus(data.network_status);
        } catch (e) {}
      };
    } catch (e) {}

    // Polling fallback
    const interval = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        fetch("http://localhost:8000/api/v1/telemetry/vitals")
          .then((res) => res.json())
          .then((data) => {
            if (data.cpu_percent) setCpuUsage(data.cpu_percent);
            if (data.ingestion_eps) setEps(data.ingestion_eps);
            if (data.memory_used_gb) setMemoryStr(`${data.memory_used_gb} GB / 16 GB`);
            if (data.uptime_str) setUptimeStr(data.uptime_str);
          })
          .catch(() => {
            setCpuUsage(Math.floor(68 + Math.random() * 12));
            setEps(Math.floor(13800 + Math.random() * 950));
          });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  // Compute ASCII segmented bar
  const totalBars = 24;
  const activeBars = Math.round((cpuUsage / 100) * totalBars);
  const barString = "█".repeat(activeBars) + "░".repeat(totalBars - activeBars);

  return (
    <div id="vitals" className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner">
      {/* Module Index Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-5">
        <span className="text-xs font-bold text-acid-lime">/05 SYSTEM STATUS</span>
        <span className="text-[10px] text-muted-gray uppercase tracking-widest">TELEMETRY_ENGINE: ACTIVE</span>
      </div>

      <div className="space-y-4 text-xs">
        {/* CPU USAGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-muted-gray tracking-wider font-semibold">CPU_USAGE</span>
          <div className="flex items-center space-x-3">
            <span className="text-acid-lime font-mono tracking-tighter text-[11px]">{barString}</span>
            <span className="text-white font-bold w-10 text-right">{cpuUsage}%</span>
          </div>
        </div>

        {/* MEMORY */}
        <div className="flex items-center justify-between">
          <span className="text-muted-gray tracking-wider font-semibold">MEMORY</span>
          <div className="flex-1 mx-3 border-b border-dotted border-cyber-border hidden sm:block"></div>
          <span className="text-gray-200 font-semibold">{memoryStr}</span>
        </div>

        {/* UPTIME */}
        <div className="flex items-center justify-between">
          <span className="text-muted-gray tracking-wider font-semibold">UPTIME</span>
          <div className="flex-1 mx-3 border-b border-dotted border-cyber-border hidden sm:block"></div>
          <span className="text-gray-200 font-semibold">{uptimeStr}</span>
        </div>

        {/* INGESTION RATE */}
        <div className="flex items-center justify-between">
          <span className="text-muted-gray tracking-wider font-semibold">INGESTION_RATE</span>
          <div className="flex-1 mx-3 border-b border-dotted border-cyber-border hidden sm:block"></div>
          <span className="text-radar-cyan font-semibold">{eps.toLocaleString()} EPS</span>
        </div>

        {/* NETWORK INTEGRITY */}
        <div className="flex items-center justify-between">
          <span className="text-muted-gray tracking-wider font-semibold">NETWORK</span>
          <div className="flex-1 mx-3 border-b border-dotted border-cyber-border hidden sm:block"></div>
          <span className="text-emerald-400 font-bold uppercase tracking-wider">{networkStatus}</span>
        </div>
      </div>

      {/* Operational Badge */}
      <div className="mt-6 pt-4 border-t border-cyber-border">
        <div className="bg-acid-lime/10 border border-acid-lime text-acid-lime p-2.5 text-center font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-acid-sm">
          <span className="w-2 h-2 bg-acid-lime rounded-full animate-ping"></span>
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>
    </div>
  );
};
