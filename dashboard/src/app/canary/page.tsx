"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Key, Terminal, Zap, Radio, AlertTriangle, Plus, Lock, CheckCircle2 } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface CanaryToken {
  id: string;
  name: string;
  type: string;
  location: string;
  payload_value: string;
  status: string;
  tripped: boolean;
  created_at: string;
  trip_count: number;
  last_tripped_at?: string;
  last_tripped_by?: string;
}

export default function CanaryPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [tokens, setTokens] = useState<CanaryToken[]>([]);
  const [trippedAlarm, setTrippedAlarm] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState({
    name: "CANARY-PROD-KUBE-SECRET",
    token_type: "cloud_token",
    location: "DMZ-NGINX-EDGE:/etc/kubernetes/admin.conf",
    payload_value: "k8s_fake_token_sup3r_secret_2026",
  });

  const loadCanaries = () => {
    fetch("http://localhost:8000/api/v1/canary/tokens")
      .then((res) => res.json())
      .then((data) => {
        setTokens(data.tokens || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCanaries();
  }, []);

  const handleTriggerCanary = (tokenId: string) => {
    fetch("http://localhost:8000/api/v1/canary/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_id: tokenId, intruder_ip: "10.0.3.104" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTrippedAlarm(data);
        loadCanaries();
        setTimeout(() => setTrippedAlarm(null), 6000);
      })
      .catch(() => {});
  };

  const handleDeployToken = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    fetch("http://localhost:8000/api/v1/canary/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setIsDeploying(false);
        loadCanaries();
      })
      .catch(() => {
        setIsDeploying(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4ff00] font-mono selection:bg-[#d4ff00] selection:text-black flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Matrix */}
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
              <span>CANARY_HONEY_MESH</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <Key className="w-8 h-8 md:w-12 md:h-12 text-[#d4ff00]" />
              CANARY_MESH // DECEPTION_TRAPS
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-[#d4ff00] text-black px-2.5 py-1 font-bold uppercase tracking-wider">
              0% FALSE POSITIVE GUARANTEE
            </span>
          </div>
        </div>

        {/* Alarm Banner if Triggered */}
        {trippedAlarm && (
          <div className="bg-[#ff003c] text-black font-bold p-4 border-2 border-white animate-pulse space-y-1">
            <div className="flex justify-between items-center text-xs tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                CANARY_TRIPWIRE_BREACHED: {trippedAlarm.token_name}
              </span>
              <span>FPR: 0.0% (VERIFIED_INTRUDER)</span>
            </div>
            <div className="text-xs font-mono">
              INTRUDER_SRC: {trippedAlarm.intruder_source} | ACTION: {trippedAlarm.containment_action}
            </div>
          </div>
        )}

        {/* Grid: Tokens List (Left 2 cols) & Deploy Bait Wizard (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deployed Honey-Tokens List */}
          <div className="lg:col-span-2 border-2 border-[#222] bg-[#0c0c0c] p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-[#222] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                DEPLOYED_HONEY_TOKENS ({tokens.length})
              </span>
              <span className="text-[10px] text-[#666] uppercase">ACTIVE_DECEPTION_LAYER</span>
            </div>

            <div className="space-y-3">
              {tokens.map((token) => {
                const isTripped = token.tripped || token.status === "TRIPPED";

                return (
                  <div
                    key={token.id}
                    className={`p-4 border-2 transition-all ${
                      isTripped
                        ? "border-[#ff003c] bg-[#ff003c]/10"
                        : "border-[#222] bg-[#090909] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isTripped ? "bg-[#ff003c] animate-ping" : "bg-[#d4ff00]"
                            }`}
                          />
                          <span className="text-white font-black text-sm tracking-wider">{token.name}</span>
                          <span className="text-[9px] bg-[#1a1a1a] text-[#888] px-1.5 py-0.5 uppercase">
                            {token.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#888] font-mono mt-1">LOC: {token.location}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                            isTripped ? "bg-[#ff003c] text-black" : "bg-[#222] text-[#d4ff00]"
                          }`}
                        >
                          {token.status}
                        </span>

                        <button
                          onClick={() => handleTriggerCanary(token.id)}
                          className="text-[10px] bg-[#151515] border border-[#ff003c] text-[#ff003c] hover:bg-[#ff003c] hover:text-black px-2 py-1 uppercase font-bold transition-colors"
                        >
                          SIMULATE_TRIP
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] bg-[#111] p-2 text-[#aaa] font-mono border border-[#1f1f1f] truncate">
                      PAYLOAD: {token.payload_value}
                    </div>

                    {token.last_tripped_at && (
                      <div className="mt-2 text-[10px] text-[#ff003c] font-mono flex justify-between">
                        <span>LAST_BREACH: {token.last_tripped_at}</span>
                        <span>BY: {token.last_tripped_by}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deploy New Honey-Token Bait Wizard */}
          <div className="border-2 border-[#222] bg-[#0c0c0c] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-[#222] pb-3">
                <span className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">
                  PROVISION_DECEPTION_BAIT
                </span>
                <h3 className="text-lg font-black text-white">DEPLOY_NEW_CANARY</h3>
              </div>

              <form onSubmit={handleDeployToken} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#888] uppercase block mb-1">TOKEN_NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-white p-2 focus:outline-none focus:border-[#d4ff00] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#888] uppercase block mb-1">TOKEN_TYPE</label>
                  <select
                    value={formData.token_type}
                    onChange={(e) => setFormData({ ...formData, token_type: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-white p-2 focus:outline-none focus:border-[#d4ff00] font-mono"
                  >
                    <option value="cloud_token">Cloud Credential (AWS/GCP)</option>
                    <option value="decoy_service">Decoy Service (Fake SSH/Redis)</option>
                    <option value="database_token">Database Honey Password</option>
                    <option value="honey_file">FIM Ransomware Bait File</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#888] uppercase block mb-1">TARGET_LOCATION</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-white p-2 focus:outline-none focus:border-[#d4ff00] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#888] uppercase block mb-1">PAYLOAD_VALUE</label>
                  <input
                    type="text"
                    value={formData.payload_value}
                    onChange={(e) => setFormData({ ...formData, payload_value: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] text-white p-2 focus:outline-none focus:border-[#d4ff00] font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDeploying}
                  className="w-full bg-[#d4ff00] text-black hover:bg-white py-2.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mt-4 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {isDeploying ? "DEPLOYING..." : "DEPLOY_CANARY_TRAP"}
                </button>
              </form>
            </div>

            <div className="bg-[#111] border border-[#222] p-3 text-[10px] text-[#888] space-y-1">
              <span className="text-[#d4ff00] font-bold block uppercase">AUTONOMOUS_TRIPWIRE_POLICY:</span>
              <p>
                Any access to a canary token or decoy port results in instant high-priority containment with zero
                analyst verification required.
              </p>
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
        onLaunchSuccess={loadCanaries}
      />
    </div>
  );
}
