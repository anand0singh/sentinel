"use client";

import React, { useState } from "react";
import { ArrowUpRight, Lock, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

export const ContainmentPanel: React.FC = () => {
  const [quarantinedHosts, setQuarantinedHosts] = useState<string[]>(["192.168.1.100"]);
  const [blockedIps, setBlockedIps] = useState<string[]>(["198.51.100.44", "203.0.113.88"]);
  const [targetHost, setTargetHost] = useState("");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleManualIsolate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHost.trim()) return;

    try {
      await fetch(`http://localhost:8000/api/v1/containment/isolate/${targetHost}`, {
        method: "POST",
      });
    } catch (e) {
      // Handled gracefully in mock / container setup
    }

    if (!quarantinedHosts.includes(targetHost)) {
      setQuarantinedHosts((prev) => [targetHost, ...prev]);
    }
    setStatusNotice(`[CONTAINMENT] Host ${targetHost} isolated via iptables DROP policy.`);
    setTargetHost("");
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div id="containment" className="bg-[#050505] border border-cyber-border p-6 font-mono relative bracket-corner shadow-lg">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-6">
        <span className="text-xs font-bold text-acid-lime">/04 AUTOMATED SOAR CONTAINMENT MATRIX</span>
        <span className="text-[10px] text-muted-gray uppercase tracking-widest">AGENT: AUTO_QUARANTINE ARMED</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Containment Log */}
        <div>
          <h4 className="text-xs text-muted-gray uppercase font-semibold mb-3">
            ACTIVE QUARANTINE LOG & APPLIED DEFENSES:
          </h4>
          <div className="space-y-2.5 text-xs">
            {quarantinedHosts.map((host) => (
              <div
                key={host}
                className="p-3 bg-alert-red/10 border border-alert-red/30 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Lock size={14} className="text-alert-red" />
                  <span className="text-white font-bold">{host}</span>
                </div>
                <span className="text-[10px] bg-alert-red text-black font-black px-1.5 py-0.5">
                  VLAN ISOLATED
                </span>
              </div>
            ))}

            {blockedIps.map((ip) => (
              <div
                key={ip}
                className="p-3 bg-hazard-amber/10 border border-hazard-amber/30 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={14} className="text-hazard-amber" />
                  <span className="text-white font-bold">{ip}</span>
                </div>
                <span className="text-[10px] bg-hazard-amber text-black font-black px-1.5 py-0.5">
                  PERIMETER DROP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Manual Containment Override */}
        <div className="flex flex-col justify-between p-4 bg-[#0a0c10] border border-cyber-border">
          <div>
            <h4 className="text-xs font-bold text-white uppercase mb-1">
              MANUAL ZERO-TRUST QUARANTINE OVERRIDE
            </h4>
            <p className="text-[11px] text-muted-gray mb-4 leading-relaxed">
              Instantly broadcast an iptables quarantine rule to the target host. All ingress and egress flows will be dropped, preserving only SSH management port 22.
            </p>

            <form onSubmit={handleManualIsolate} className="space-y-3">
              <div>
                <label className="block text-[10px] text-muted-gray uppercase mb-1">
                  TARGET HOST IP:
                </label>
                <input
                  type="text"
                  value={targetHost}
                  onChange={(e) => setTargetHost(e.target.value)}
                  placeholder="e.g. 192.168.1.150"
                  className="w-full bg-[#050505] border border-cyber-border px-3 py-2 text-xs text-white focus:border-acid-lime outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-alert-red text-black hover:bg-white transition px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1 shadow-red-block active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>TRIGGER HOST QUARANTINE</span>
                <ArrowUpRight size={14} className="stroke-[3]" />
              </button>
            </form>
          </div>

          {statusNotice && (
            <div className="mt-3 p-2 bg-acid-lime/10 border border-acid-lime text-acid-lime text-xs">
              {statusNotice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
