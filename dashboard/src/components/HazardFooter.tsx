"use client";

import React from "react";

export const HazardFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-cyber-border bg-[#050505] font-mono">
      {/* Hazard Diagonal Warning Stripes Banner */}
      <div className="w-full h-8 hazard-stripes flex items-center justify-center border-y border-cyber-border overflow-hidden">
        <div className="bg-black/90 px-6 py-1 border-x border-acid-lime/50 text-acid-lime font-display font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 shadow-acid-sm">
          <span className="w-2 h-2 bg-acid-lime inline-block animate-ping"></span>
          &gt; SENTINEL CORE ACTIVE _ AUTONOMOUS SHIELD ONLINE
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-muted-gray">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="bg-acid-lime text-black px-2.5 py-1 font-display font-black text-sm tracking-wider inline-flex items-center gap-1">
            SENTINEL_
          </div>
          <p className="text-[11px] leading-relaxed">
            Autonomous Cyber Defense Platform & Automated Cyber Range. Continuous packet inspection, graph attack-chain correlation, and automated SOAR containment.
          </p>
          <div className="text-[10px] text-gray-500">
            &copy; 2026 SENTINEL DEFENSE CORP. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-acid-lime font-display font-bold uppercase tracking-wider mb-3">
            ARCHITECTURE
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><a href="#" className="hover:text-white transition">AF_XDP Packet Tap</a></li>
            <li><a href="#" className="hover:text-white transition">Suricata + Zeek Engine</a></li>
            <li><a href="#" className="hover:text-white transition">Apache Kafka Telemetry Bus</a></li>
            <li><a href="#" className="hover:text-white transition">eBPF Kernel Probes</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-acid-lime font-display font-bold uppercase tracking-wider mb-3">
            RESOURCES
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><a href="#" className="hover:text-white transition">MITRE ATT&CK Matrix</a></li>
            <li><a href="#" className="hover:text-white transition">AlienVault OTX Feed</a></li>
            <li><a href="#" className="hover:text-white transition">ClickHouse Forensic Schemas</a></li>
            <li><a href="#" className="hover:text-white transition">SOAR Containment Rules</a></li>
          </ul>
        </div>

        {/* Security Classification */}
        <div className="p-4 bg-[#0a0c10] border border-cyber-border space-y-2">
          <div className="text-[10px] text-alert-red font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-alert-red rounded-full"></span>
            CLASSIFICATION: RESTRICTED
          </div>
          <p className="text-[10px] text-gray-400">
            Authorized personnel only. All socket connections, process forks, and raw telemetry flows are cryptographically indexed.
          </p>
          <div className="text-[9px] text-muted-gray font-mono">
            SYS_HASH: SHA256:d41d8cd98f00b204e9800998ecf8427e
          </div>
        </div>
      </div>
    </footer>
  );
};
