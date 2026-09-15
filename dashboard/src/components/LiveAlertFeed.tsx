"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert, ChevronDown, ChevronUp, Radio } from "lucide-react";

export interface AlertItem {
  alert_id: string;
  timestamp: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source_ip: string;
  destination_ip: string;
  mitre_technique: string;
  attack_chain_stage?: string;
  description?: string;
  forensic_payload?: string;
}

export const LiveAlertFeed: React.FC<{ initialAlerts: AlertItem[] }> = ({ initialAlerts }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket Live Streaming Integration (Phase 2)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket("ws://localhost:8000/ws/alerts");

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const newAlert = JSON.parse(event.data);
            setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
          } catch (e) {
            console.error("Failed to parse websocket message", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-alert-red text-black font-black";
      case "HIGH":
        return "bg-hazard-amber text-black font-black";
      case "MEDIUM":
        return "bg-radar-cyan text-black font-bold";
      default:
        return "bg-gray-800 text-gray-300";
    }
  };

  return (
    <div className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-4">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-acid-lime" />
          <h2 className="text-xs font-bold text-acid-lime uppercase tracking-wider">
            /03 LIVE TELEMETRY INGESTION STREAM
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-acid-lime animate-pulse" : "bg-muted-gray"}`} />
          <span className="text-muted-gray">{isConnected ? "WS_CONNECTED" : "IN_MEMORY_STREAM"}</span>
        </div>
      </div>

      {/* Alert Feed Container */}
      <div className="overflow-y-auto space-y-2.5 max-h-[500px] pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-gray text-xs">
            &gt; No active anomalies detected. Tap "SIMULATE ATTACK" to inject Red-Team vectors.
          </div>
        ) : (
          alerts.map((a, idx) => {
            const isExpanded = expandedId === a.alert_id;
            return (
              <div
                key={a.alert_id || idx}
                className="p-3.5 bg-[#0a0c10] border border-cyber-border hover:border-acid-lime/50 transition cursor-pointer text-xs"
                onClick={() => toggleExpand(a.alert_id)}
              >
                {/* Top Row: Severity + Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] uppercase ${getSeverityBadge(a.severity)}`}>
                      {a.severity}
                    </span>
                    {a.attack_chain_stage && (
                      <span className="text-[10px] text-acid-lime border border-acid-lime/30 px-1.5 py-0.5">
                        STAGE: {a.attack_chain_stage}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-gray">
                    {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "LIVE"}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-display font-bold text-white text-sm tracking-wide mb-2">
                  {a.title}
                </h4>

                {/* Network Coordinates */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-gray gap-2 pt-2 border-t border-cyber-border">
                  <div>
                    SRC: <strong className="text-gray-200">{a.source_ip}</strong>
                  </div>
                  <div>
                    DST: <strong className="text-gray-200">{a.destination_ip}</strong>
                  </div>
                  <div className="text-acid-lime font-bold">{a.mitre_technique}</div>
                </div>

                {/* Expandable Forensic Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-cyber-border text-[11px] text-gray-300 space-y-2 bg-[#050505] p-3 border border-cyber-border">
                    <p className="text-muted-gray font-semibold">DESCRIPTION:</p>
                    <p className="text-white font-mono text-[10px]">{a.description || "Heuristic detection rule triggered."}</p>
                    {a.forensic_payload && (
                      <>
                        <p className="text-muted-gray font-semibold mt-2">RAW FORENSIC PAYLOAD:</p>
                        <pre className="bg-[#0e1117] p-2 text-[10px] text-acid-lime overflow-x-auto border border-cyber-border">
                          {a.forensic_payload}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
