"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Terminal } from "lucide-react";

interface HeaderProps {
  onOpenSimulation?: () => void;
  onOpenSimModal?: () => void;
}

export const BrutalistHeader: React.FC<HeaderProps> = ({ onOpenSimulation, onOpenSimModal }) => {
  const [timeStr, setTimeStr] = useState("00:00:00 UTC+0");
  const handleOpen = onOpenSimulation || onOpenSimModal || (() => {});

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setTimeStr(`${h}:${m}:${s} UTC+0`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-cyber-border bg-[#050505] px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand Logo Box */}
      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
        <Link href="/" className="inline-flex items-center group">
          <div className="bg-acid-lime text-black px-3 py-1.5 font-display font-extrabold text-base tracking-wider flex items-center gap-1.5 shadow-acid-sm">
            <span className="w-2.5 h-2.5 bg-black inline-block"></span>
            SENTINEL_
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden xl:flex items-center space-x-3 font-mono text-xs uppercase tracking-wider text-muted-gray">
          <Link href="/" className="hover:text-white transition flex items-center gap-0.5">
            DEFENSE <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/topology" className="hover:text-white transition flex items-center gap-0.5 text-acid-lime font-bold">
            TOPOLOGY <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/copilot" className="hover:text-white transition flex items-center gap-0.5 text-acid-lime font-bold">
            COPILOT <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/endpoints" className="hover:text-white transition flex items-center gap-0.5">
            FLEET <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/canary" className="hover:text-white transition flex items-center gap-0.5">
            CANARY <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/benchmark" className="hover:text-white transition flex items-center gap-0.5">
            BENCHMARK <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/playbooks" className="hover:text-white transition flex items-center gap-0.5">
            PLAYBOOKS <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/forensics" className="hover:text-white transition flex items-center gap-0.5">
            PACKETS <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/threat-intel" className="hover:text-white transition flex items-center gap-0.5">
            INTEL <span className="text-acid-lime">+</span>
          </Link>
          <Link href="/timeline" className="hover:text-white transition flex items-center gap-0.5">
            TIMELINE <span className="text-acid-lime">+</span>
          </Link>
        </nav>
      </div>

      {/* Right Controls & Action Button */}
      <div className="flex items-center space-x-5 font-mono text-xs w-full md:w-auto justify-between md:justify-end">
        {/* Live UTC Clock */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] text-muted-gray uppercase tracking-widest">SYS_TIME</span>
          <span className="text-acid-lime font-bold tracking-wider">{timeStr}</span>
        </div>

        {/* DEFCON Status */}
        <div className="flex items-center space-x-1.5 bg-cyber-card border border-cyber-border px-3 py-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-alert-red animate-pulse"></span>
          <span className="text-muted-gray">DEFCON:</span>
          <span className="text-white font-black">2</span>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpen}
          className="bg-acid-lime text-black hover:bg-white transition px-4 py-2 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-acid-block active:translate-x-0.5 active:translate-y-0.5"
        >
          <span>SIMULATE ATTACK</span>
          <ArrowUpRight size={16} className="stroke-[3]" />
        </button>
      </div>
    </header>
  );
};
