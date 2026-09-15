"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Cpu, Database, RefreshCw, Search, ShieldAlert, Zap } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface BloomStats {
  capacity: number;
  total_iocs: number;
  active_bits: number;
  bitset_density_pct: number;
  num_hashes: number;
  estimated_fpr: number;
  avg_lookup_latency_us: number;
}

interface Feed {
  id: string;
  name: string;
  type: string;
  iocs_count: number;
  sync_interval_min: number;
  status: string;
  last_synced: string;
}

export default function ThreatIntelPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [stats, setStats] = useState<BloomStats>({
    capacity: 1000000,
    total_iocs: 4129,
    active_bits: 16516,
    bitset_density_pct: 1.652,
    num_hashes: 4,
    estimated_fpr: 0.0001,
    avg_lookup_latency_us: 1.25,
  });

  const [feeds, setFeeds] = useState<Feed[]>([
    { id: "FEED-01", name: "AlienVault OTX Community", type: "IP / Domain / Hash", iocs_count: 4129, sync_interval_min: 60, status: "SYNCHRONIZED", last_synced: "2m ago" },
    { id: "FEED-02", name: "MISP CIRCL Threat Sharing", type: "Actor Attribution / C2", iocs_count: 2890, sync_interval_min: 30, status: "SYNCHRONIZED", last_synced: "5m ago" },
    { id: "FEED-03", name: "abuse.ch URLhaus Malware", type: "Payload Drops / URLs", iocs_count: 1840, sync_interval_min: 15, status: "SYNCHRONIZED", last_synced: "1m ago" },
    { id: "FEED-04", name: "Emerging Threats Open Rules", type: "Suricata Signatures", iocs_count: 32800, sync_interval_min: 120, status: "SYNCHRONIZED", last_synced: "14m ago" },
  ]);

  const [queryInput, setQueryInput] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/intel/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});

    fetch("http://localhost:8000/api/v1/intel/feeds")
      .then((res) => res.json())
      .then((data) => {
        if (data.feeds) setFeeds(data.feeds);
      })
      .catch(() => {});
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setIsQuerying(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/intel/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ioc: queryInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      } else {
        throw new Error("Lookup error");
      }
    } catch (err) {
      // Local fallback mock
      const isKnownBad = ["198.51.100.44", "203.0.113.88", "45.33.32.156"].includes(queryInput.trim());
      setLookupResult({
        ioc: queryInput.trim(),
        status: isKnownBad ? "MALICIOUS" : "CLEAN",
        threat_score: isKnownBad ? 95.0 : 0.0,
        threat_type: isKnownBad ? "CobaltStrike C2 Server" : "No known threats found",
        family: isKnownBad ? "CobaltStrike" : "None",
        source: isKnownBad ? "ALIENVAULT_OTX_BLOOM_HIT" : "BLOOM_FILTER_ZERO_MISS",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleSync = async (feedName: string) => {
    setSyncFeedback(`Syncing latest IOC indicators from '${feedName}'...`);
    try {
      const res = await fetch("http://localhost:8000/api/v1/intel/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_name: feedName }),
      });
      if (res.ok) {
        const data = await res.json();
        setSyncFeedback(`Successfully synced ${feedName}. Total IOCs: ${data.total_iocs}`);
      }
    } catch (e) {
      setSyncFeedback(`Simulated sync complete for ${feedName}. Bloom filter updated.`);
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-10 flex-1">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyber-border gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-muted-gray mb-1">
              <Link href="/" className="text-acid-lime hover:underline flex items-center gap-1">
                <ArrowLeft size={12} /> SENTINEL_
              </Link>
              <span>/</span>
              <span>THREAT_INTEL</span>
              <span>/</span>
              <span className="text-white">BLOOM_FILTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider uppercase text-white">
              THREAT INTELLIGENCE & BLOOM RADAR
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-muted-gray">FILTER TYPE:</span>
            <span className="text-acid-lime font-bold">BITSET 4-HASH BLOOM</span>
          </div>
        </div>

        {syncFeedback && (
          <div className="p-3 bg-acid-lime/10 border border-acid-lime text-acid-lime text-xs font-mono animate-pulse">
            {syncFeedback}
          </div>
        )}

        {/* Bloom Filter Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">RADAR /01</div>
            <div className="text-4xl font-display font-black text-acid-lime my-1">
              {stats.capacity.toLocaleString()}
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>FILTER BITSET CAPACITY</span>
              <span className="text-acid-lime-dim">BITS</span>
            </div>
          </div>

          <div className="p-5 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">RADAR /02</div>
            <div className="text-4xl font-display font-black text-radar-cyan my-1">
              {stats.avg_lookup_latency_us}
              <span className="text-lg ml-1 text-muted-gray font-normal">&mu;s</span>
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>AVG LOOKUP LATENCY</span>
              <span className="text-radar-cyan">MICROSEC</span>
            </div>
          </div>

          <div className="p-5 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">RADAR /03</div>
            <div className="text-4xl font-display font-black text-white my-1">
              {stats.total_iocs.toLocaleString()}
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>INDEXED IOC REPUTATIONS</span>
              <span className="text-gray-400">CACHED</span>
            </div>
          </div>

          <div className="p-5 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">RADAR /04</div>
            <div className="text-4xl font-display font-black text-emerald-400 my-1">
              {stats.bitset_density_pct}%
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>BITSET DENSITY (FILL)</span>
              <span className="text-emerald-400">OPTIMAL</span>
            </div>
          </div>
        </div>

        {/* Instant IOC Lookup Terminal */}
        <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
            <span className="text-xs font-bold text-acid-lime uppercase tracking-widest flex items-center gap-1.5">
              <Search size={14} /> // INSTANT IOC REPUTATION LOOKUP TERMINAL
            </span>
            <span className="text-[10px] text-muted-gray">MICROSECOND PRE-FILTER</span>
          </div>

          <form onSubmit={handleLookup} className="flex gap-2 mb-4">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="ENTER IP, DOMAIN, OR SHA256 HASH (e.g. 198.51.100.44)..."
              className="flex-1 bg-[#0a0c10] border border-cyber-border px-4 py-3 text-xs text-white placeholder-muted-gray focus:border-acid-lime outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isQuerying}
              className="bg-acid-lime text-black hover:bg-white transition px-6 py-3 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-1 shadow-acid-block active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>{isQuerying ? "SCANNING..." : "QUERY RADAR"}</span>
              <ArrowUpRight size={16} className="stroke-[3]" />
            </button>
          </form>

          {/* Lookup Result Box */}
          {lookupResult && (
            <div
              className={`p-4 border font-mono text-xs ${
                lookupResult.status === "MALICIOUS"
                  ? "bg-alert-red/10 border-alert-red/40 text-white"
                  : "bg-emerald-500/10 border-emerald-500/40 text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{lookupResult.ioc}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 font-black ${
                    lookupResult.status === "MALICIOUS"
                      ? "bg-alert-red text-black"
                      : "bg-emerald-400 text-black"
                  }`}
                >
                  {lookupResult.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-cyber-border text-[11px] text-gray-300">
                <div>THREAT SCORE: <strong className="text-acid-lime">{lookupResult.threat_score}/100</strong></div>
                <div>CLASSIFICATION: <strong>{lookupResult.threat_type || lookupResult.details}</strong></div>
                <div>SOURCE: <strong className="text-radar-cyan">{lookupResult.source}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Subscribed Threat Feeds Table */}
        <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
            <span className="text-xs font-bold text-acid-lime uppercase tracking-widest">
              // SUBSCRIBED THREAT INTELLIGENCE FEEDS ({feeds.length})
            </span>
            <span className="text-[10px] text-muted-gray">CONTINUOUS INGESTION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cyber-border text-muted-gray text-[10px] uppercase">
                  <th className="py-2.5">FEED ID</th>
                  <th className="py-2.5">FEED PROVIDER</th>
                  <th className="py-2.5">INDICATOR TYPE</th>
                  <th className="py-2.5">IOC COUNT</th>
                  <th className="py-2.5">INTERVAL</th>
                  <th className="py-2.5">STATUS</th>
                  <th className="py-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {feeds.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-muted-gray">{f.id}</td>
                    <td className="py-3 font-bold text-white">{f.name}</td>
                    <td className="py-3 text-radar-cyan">{f.type}</td>
                    <td className="py-3 text-acid-lime font-bold">{f.iocs_count.toLocaleString()}</td>
                    <td className="py-3 text-muted-gray">{f.sync_interval_min} min</td>
                    <td className="py-3">
                      <span className="text-[9px] bg-acid-lime text-black font-black px-1.5 py-0.5">
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleSync(f.name)}
                        className="bg-transparent border border-cyber-border hover:border-acid-lime text-muted-gray hover:text-white px-2.5 py-1 text-[10px] font-bold uppercase transition inline-flex items-center space-x-1"
                      >
                        <RefreshCw size={10} />
                        <span>SYNC [ ]</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <HazardFooter />

      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}
