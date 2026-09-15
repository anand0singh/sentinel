"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Terminal, Shield, Zap, Search, Copy, Check, FileText, Play, Radio } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface CopilotAnalysis {
  analysis_id: string;
  generated_at: string;
  incident_summary: string;
  severity: string;
  confidence_score: number;
  threat_actor_attribution: string;
  mitre_alignment: {
    tactic: string;
    technique: string;
  };
  root_cause_synthesis: string;
  executive_narrative: string;
  blast_radius_impact: string;
  recommended_actions: string[];
  containment_scripts: {
    bash: string;
    powershell: string;
  };
}

export default function CopilotPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [queryInput, setQueryInput] = useState("Show outbound connection to port 4444");
  const [isQuerying, setIsQuerying] = useState(false);
  const [huntResults, setHuntResults] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const [activeAnalysis, setActiveAnalysis] = useState<CopilotAnalysis>({
    analysis_id: "SOC-AI-INIT-01",
    generated_at: new Date().toISOString(),
    incident_summary: "Cobalt Strike Jittered C2 Beaconing & Pass-the-Hash Movement",
    severity: "CRITICAL",
    confidence_score: 0.98,
    threat_actor_attribution: "APT29 (Cozy Bear) / FIN7",
    mitre_alignment: {
      tactic: "Command and Control / Lateral Movement",
      technique: "T1071.001 (Web Protocols) & T1021.002 (SMB Shares)",
    },
    root_cause_synthesis:
      "Compromised Nginx reverse proxy running vulnerable Log4j library. Adversary injected payload, initiated meterpreter listener on port 4444, and harvested LSASS hashes via Pass-the-Hash.",
    executive_narrative:
      "SENTINEL Autonomous Copilot correlated 14 raw eBPF socket connect events with Suricata DPI signature matches. Threat actor telemetry exhibits high-density congruence with known state-sponsored staging profiles.",
    blast_radius_impact:
      "Initial ingress isolated to 10.0.0.50. High probability lateral reach into 10.0.1.5 (Domain Controller) severed by SOAR auto-containment.",
    recommended_actions: [
      "Zero-Trust sever connection to 198.51.100.42:4444",
      "Revoke Kerberos TGT tickets across all service accounts",
      "Acquire RAM image on DMZ-NGINX-EDGE for Volatility memory analysis",
      "Deploy Canary Honey-Tokens in subnets 10.0.1.0/24 and 10.0.3.0/24",
    ],
    containment_scripts: {
      bash: "iptables -A OUTPUT -d 198.51.100.42 -j DROP\nconntrack -D -d 198.51.100.42\npkill -9 -f 'beacon'",
      powershell:
        "New-NetFirewallRule -DisplayName 'Block-C2-198.51.100.42' -Direction Outbound -RemoteAddress 198.51.100.42 -Action Block\nGet-Process | Where-Object { $_.Path -like '*beacon*' } | Stop-Process -Force",
    },
  });

  // Run natural language threat hunt
  const handleRunHunt = (q: string = queryInput) => {
    setIsQuerying(true);
    fetch("http://localhost:8000/api/v1/copilot/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    })
      .then((res) => res.json())
      .then((data) => {
        setHuntResults(data);
        setIsQuerying(false);
      })
      .catch(() => {
        setIsQuerying(false);
      });
  };

  // Run initial hunt
  useEffect(() => {
    handleRunHunt("Show outbound connection to port 4444");
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(type);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4ff00] font-mono selection:bg-[#d4ff00] selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Header */}
      <BrutalistHeader onOpenSimModal={() => setIsSimModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-grow z-10 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[#d4ff00] pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest text-[#888] mb-2 uppercase">
              <Link href="/" className="hover:text-[#d4ff00] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> COMMAND_HUD
              </Link>
              <span>/</span>
              <span className="text-[#d4ff00]">PHASE_03</span>
              <span>/</span>
              <span>AI_SOC_COPILOT</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <Bot className="w-8 h-8 md:w-12 md:h-12 text-[#d4ff00]" />
              AI_SOC_COPILOT // AUTONOMOUS_ANALYST
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-[#d4ff00] text-black px-2.5 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-ping" />
              NEURAL_ANALYST_ONLINE
            </span>
          </div>
        </div>

        {/* Natural Language Threat Hunter Query Terminal */}
        <div className="border-2 border-[#d4ff00] bg-[#0c0c0c] p-4 shadow-[0_0_20px_rgba(212,255,0,0.1)]">
          <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#d4ff00]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                NATURAL_LANGUAGE_THREAT_HUNTER // TELEMETRY_SEARCH
              </span>
            </div>
            <span className="text-[10px] text-[#666] uppercase">SYNTAX: NL_TO_VECTOR_SQL</span>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-[#666] absolute left-3 top-3" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunHunt(queryInput)}
                placeholder="Ask e.g. 'Show outbound connection to port 4444' or 'Find encoded PowerShell commands'..."
                className="w-full bg-[#111] border border-[#333] text-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#d4ff00] font-mono placeholder:text-[#555]"
              />
            </div>
            <button
              onClick={() => handleRunHunt(queryInput)}
              disabled={isQuerying}
              className="bg-[#d4ff00] text-black hover:bg-white px-6 py-2 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isQuerying ? "SCANNING..." : "DISPATCH_HUNT"}
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <span className="text-[10px] text-[#666] uppercase">PRESETS:</span>
            {[
              "Show outbound connection to port 4444",
              "Find powershell execution with base64 bypass",
              "Scan for lateral SMB psexec pipes",
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQueryInput(preset);
                  handleRunHunt(preset);
                }}
                className="text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-[#bbb] hover:text-[#d4ff00] px-2 py-1 border border-[#2a2a2a] transition-colors"
              >
                &gt; {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Threat Hunter Search Findings */}
        {huntResults && (
          <div className="border border-[#222] bg-[#090909] p-4">
            <div className="flex justify-between items-center border-b border-[#222] pb-2 mb-3 text-xs">
              <span className="text-[#888] uppercase">
                SCANNED {huntResults.records_scanned?.toLocaleString()} RECORDS // MATCHES FOUND:{" "}
                <span className="text-[#d4ff00] font-bold">{huntResults.matches_found}</span>
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                  huntResults.threat_hunter_verdict.includes("CRITICAL")
                    ? "bg-[#ff003c] text-black"
                    : "bg-[#222] text-[#d4ff00]"
                }`}
              >
                {huntResults.threat_hunter_verdict}
              </span>
            </div>

            <div className="space-y-2">
              {huntResults.findings.map((f: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#0e0e0e] border border-[#1f1f1f] p-3 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{f.host}</span>
                      <span className="text-[#d4ff00] text-[10px] bg-[#1a1a1a] px-1.5 py-0.2">{f.event_type}</span>
                    </div>
                    <div className="text-[11px] text-[#888] font-mono">
                      PROC: <span className="text-[#bbb]">{f.process}</span> | DEST:{" "}
                      <span className="text-white font-bold">{f.destination}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold block ${
                        f.verdict.includes("MALICIOUS")
                          ? "text-[#ff003c]"
                          : f.verdict.includes("SUSPICIOUS")
                          ? "text-[#ffb700]"
                          : "text-[#d4ff00]"
                      }`}
                    >
                      {f.verdict}
                    </span>
                    <span className="text-[10px] text-[#666]">{f.bytes_transferred}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Synthesis Executive Narrative & Scripts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Executive Narrative & MITRE Alignment (2 cols) */}
          <div className="lg:col-span-2 border-2 border-[#222] bg-[#0c0c0c] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#222] pb-4">
              <div>
                <span className="text-[10px] text-[#888] tracking-widest block uppercase mb-1">
                  INCIDENT_ROOT_CAUSE_SYNTHESIS
                </span>
                <h2 className="text-2xl font-black text-white">{activeAnalysis.incident_summary}</h2>
              </div>
              <span className="bg-[#ff003c] text-black px-2.5 py-1 text-xs font-bold uppercase">
                {activeAnalysis.severity}
              </span>
            </div>

            {/* Attribution & MITRE Alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-[#222] bg-[#111] p-3">
                <span className="text-[10px] text-[#666] uppercase block mb-1">ATTRIBUTION_SIMILARITY</span>
                <span className="text-white font-bold text-sm block">{activeAnalysis.threat_actor_attribution}</span>
                <span className="text-[#d4ff00] text-[10px]">CONFIDENCE: {activeAnalysis.confidence_score * 100}%</span>
              </div>
              <div className="border border-[#222] bg-[#111] p-3">
                <span className="text-[10px] text-[#666] uppercase block mb-1">MITRE_ATT&amp;CK_ALIGNMENT</span>
                <span className="text-white font-bold text-sm block">{activeAnalysis.mitre_alignment.tactic}</span>
                <span className="text-[#888] text-[10px]">{activeAnalysis.mitre_alignment.technique}</span>
              </div>
            </div>

            {/* Detailed Synthesis */}
            <div className="space-y-3">
              <span className="text-xs text-[#888] font-bold uppercase tracking-wider block">
                AUTONOMOUS_ANALYST_FINDINGS
              </span>
              <p className="text-xs text-[#ccc] leading-relaxed bg-[#111] p-4 border-l-2 border-[#d4ff00]">
                {activeAnalysis.executive_narrative}
              </p>
            </div>

            {/* Root Cause & Blast Impact */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-[#ff003c] font-bold tracking-widest uppercase block">
                ROOT_CAUSE_IDENTIFICATION
              </span>
              <p className="text-white text-xs bg-[#151515] p-3 border border-[#222]">
                {activeAnalysis.root_cause_synthesis}
              </p>
            </div>

            {/* Recommended Containment Actions */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#d4ff00] font-bold tracking-widest uppercase block">
                RECOMMENDED_CONTAINMENT_PLAYBOOK_ACTIONS
              </span>
              <div className="space-y-1.5 text-xs">
                {activeAnalysis.recommended_actions.map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#111] p-2 border border-[#1a1a1a]">
                    <span className="text-[#d4ff00] font-bold">&gt;</span>
                    <span className="text-white">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Autonomous Remediation Scripts (1 col) */}
          <div className="border-2 border-[#222] bg-[#0a0a0a] p-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-[#222] pb-3">
                <span className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">
                  EXECUTABLE_REMEDIATION_CODE
                </span>
                <h3 className="text-lg font-black text-white">AUTONOMOUS_SCRIPTS</h3>
              </div>

              {/* Bash Script */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#d4ff00] font-bold">LINUX (BASH / IPTABLES)</span>
                  <button
                    onClick={() => copyToClipboard(activeAnalysis.containment_scripts.bash, "bash")}
                    className="text-[10px] bg-[#1a1a1a] hover:bg-[#333] text-white px-2 py-0.5 border border-[#333] flex items-center gap-1"
                  >
                    {copiedScript === "bash" ? <Check className="w-3 h-3 text-[#d4ff00]" /> : <Copy className="w-3 h-3" />}
                    {copiedScript === "bash" ? "COPIED" : "COPY"}
                  </button>
                </div>
                <pre className="text-[11px] bg-[#111] p-3 text-white border border-[#222] overflow-x-auto font-mono">
                  {activeAnalysis.containment_scripts.bash}
                </pre>
              </div>

              {/* PowerShell Script */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#00ffff] font-bold">WINDOWS (POWERSHELL)</span>
                  <button
                    onClick={() => copyToClipboard(activeAnalysis.containment_scripts.powershell, "ps")}
                    className="text-[10px] bg-[#1a1a1a] hover:bg-[#333] text-white px-2 py-0.5 border border-[#333] flex items-center gap-1"
                  >
                    {copiedScript === "ps" ? <Check className="w-3 h-3 text-[#d4ff00]" /> : <Copy className="w-3 h-3" />}
                    {copiedScript === "ps" ? "COPIED" : "COPY"}
                  </button>
                </div>
                <pre className="text-[11px] bg-[#111] p-3 text-white border border-[#222] overflow-x-auto font-mono">
                  {activeAnalysis.containment_scripts.powershell}
                </pre>
              </div>
            </div>

            {/* Generate Report Button */}
            <div className="pt-4 border-t border-[#222]">
              <button
                onClick={() => alert("Incident Post-Mortem Report exported to artifacts.")}
                className="w-full bg-[#d4ff00] text-black hover:bg-white py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> EXPORT_IR_POST_MORTEM
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <HazardFooter />

      {/* Attack Simulation Modal */}
      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onLaunchSuccess={() => handleRunHunt(queryInput)}
      />
    </div>
  );
}
