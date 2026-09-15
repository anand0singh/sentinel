"use client";

import React, { useState } from "react";
import { ArrowUpRight, Globe, Radio } from "lucide-react";

export const GlobalSensorMap: React.FC = () => {
  const [commandInput, setCommandInput] = useState("");
  const [executedMessage, setExecutedMessage] = useState<string | null>(null);

  const nodes = [
    { city: "LON", ip: "51.140.22.4", ping: "14ms", status: "ONLINE", threat: "LOW" },
    { city: "NY", ip: "198.51.100.8", ping: "22ms", status: "ONLINE", threat: "HIGH" },
    { city: "TYO", ip: "133.242.18.99", ping: "89ms", status: "ONLINE", threat: "LOW" },
    { city: "BER", ip: "194.195.210.12", ping: "18ms", status: "ONLINE", threat: "MED" },
    { city: "SGP", ip: "103.253.144.5", ping: "112ms", status: "ONLINE", threat: "LOW" },
  ];

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    setExecutedMessage(`[DISPATCH] Target '${commandInput}' routed to AF_XDP sensor matrix.`);
    setCommandInput("");
    setTimeout(() => setExecutedMessage(null), 4000);
  };

  return (
    <div className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner">
      {/* Module Index Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-5">
        <span className="text-xs font-bold text-acid-lime">/06 GLOBAL NODES & SENSOR RADAR</span>
        <span className="text-[10px] text-muted-gray uppercase tracking-widest">TAP: AF_XDP ACTIVE</span>
      </div>

      {/* Global Node Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {nodes.map((n) => (
          <div
            key={n.city}
            className={`p-2.5 border text-center transition ${
              n.threat === "HIGH"
                ? "border-alert-red/50 bg-alert-red/10 text-alert-red"
                : "border-cyber-border bg-[#0a0c10] text-gray-300 hover:border-acid-lime/40"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-muted-gray mb-1">
              <span>{n.city}</span>
              <span className={n.threat === "HIGH" ? "text-alert-red font-bold" : "text-acid-lime"}>
                {n.ping}
              </span>
            </div>
            <div className="text-xs font-bold">{n.ip}</div>
            <div className="text-[9px] uppercase tracking-wider mt-1 text-muted-gray">{n.status}</div>
          </div>
        ))}
      </div>

      {/* Command / Investigation Bar */}
      <div>
        <p className="text-xs text-muted-gray mb-2 font-semibold">
          DISPATCH INSPECTION OR PERIMETER BLOCK TO EDGE SENSORS:
        </p>
        <form onSubmit={handleCommand} className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="ENTER TARGET IP (e.g. 198.51.100.44)..."
            className="flex-1 bg-[#0a0c10] border border-cyber-border px-3.5 py-2.5 text-xs text-white placeholder-muted-gray focus:outline-none focus:border-acid-lime font-mono"
          />
          <button
            type="submit"
            className="bg-acid-lime text-black hover:bg-white transition px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-1 shadow-acid-sm whitespace-nowrap"
          >
            <span>DISPATCH</span>
            <ArrowUpRight size={14} className="stroke-[3]" />
          </button>
        </form>
        {executedMessage && (
          <div className="mt-2 text-[11px] text-acid-lime bg-acid-lime/10 p-2 border border-acid-lime/30 animate-pulse">
            {executedMessage}
          </div>
        )}
      </div>
    </div>
  );
};
