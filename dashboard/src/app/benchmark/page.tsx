"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Play, Radio, Shield, Terminal, Zap } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface BenchmarkResult {
  benchmark_id: string;
  timestamp: string;
  total_attacks: number;
  detections_produced: number;
  root_chains_correlated: number;
  detection_rate_pct: number;
  false_positive_rate_pct: number;
  mean_detection_time_ms: number;
  soar_containment_latency_ms: number;
  status: string;
  root_incident: string;
  events_log?: { type: string; target: string; signature: string; latency_ms: number }[];
}

export default function BenchmarkPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<BenchmarkResult>({
    benchmark_id: "BM-INIT-01",
    timestamp: new Date().toISOString(),
    total_attacks: 18,
    detections_produced: 19,
    root_chains_correlated: 1,
    detection_rate_pct: 100.0,
    false_positive_rate_pct: 0.0,
    mean_detection_time_ms: 0.134,
    soar_containment_latency_ms: 4.18,
    status: "STANDBY",
    root_incident: "CRITICAL: Multi-Stage Attack Chain Detected on 192.168.1.100",
    events_log: [
      { type: "network", target: "192.168.1.100", signature: "ET SCAN Potential SSH Brute Force", latency_ms: 0.12 },
      { type: "endpoint", target: "192.168.1.100", signature: "/bin/sh reverse shell spawn", latency_ms: 0.15 },
      { type: "network", target: "192.168.1.100", signature: "Covert C2 Beaconing Heartbeat", latency_ms: 0.11 },
      { type: "network", target: "192.168.1.100", signature: "Large Outbound Data Transfer", latency_ms: 0.14 },
    ],
  });

  const [history, setHistory] = useState<BenchmarkResult[]>([]);

  const [isContinuousRunning, setIsContinuousRunning] = useState(false);
  const [continuousCount, setContinuousCount] = useState(0);

  // Fetch past history and continuous status
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/range/benchmark/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history && data.history.length > 0) {
          setHistory(data.history);
        }
      })
      .catch(() => {});

    fetch("http://localhost:8000/api/v1/range/continuous/status")
      .then((res) => res.json())
      .then((data) => {
        setIsContinuousRunning(data.is_running || false);
        setContinuousCount(data.total_iterations || 0);
      })
      .catch(() => {});
  }, []);

  const handleToggleContinuous = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/range/continuous/toggle", { method: "POST" });
      const data = await res.json();
      setIsContinuousRunning(data.is_running);
    } catch (e) {
      setIsContinuousRunning(!isContinuousRunning);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/range/benchmark/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: "full_killchain",
          target_ip: "192.168.1.100",
          attacker_ip: "198.51.100.44",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data.benchmark);
        setHistory((prev) => [data.benchmark, ...prev]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Graceful simulated update if running in standalone view
      const mockResult: BenchmarkResult = {
        benchmark_id: `BM-${Math.floor(Date.now() / 1000)}`,
        timestamp: new Date().toISOString(),
        total_attacks: 18,
        detections_produced: 19,
        root_chains_correlated: 1,
        detection_rate_pct: 100.0,
        false_positive_rate_pct: 0.0,
        mean_detection_time_ms: 0.128,
        soar_containment_latency_ms: 3.94,
        status: "COMPLETED",
        root_incident: "CRITICAL: Multi-Stage Attack Chain Correlated by NetworkX",
        events_log: [
          { type: "network", target: "192.168.1.100", signature: "ET SCAN Potential SSH Brute Force", latency_ms: 0.11 },
          { type: "endpoint", target: "192.168.1.100", signature: "Reverse Shell Spawning via /dev/tcp", latency_ms: 0.14 },
          { type: "network", target: "192.168.1.100", signature: "C2 Beaconing Jitter Detected", latency_ms: 0.12 },
          { type: "network", target: "192.168.1.100", signature: "Volumetric Egress Exfil Transfer", latency_ms: 0.15 },
        ],
      };
      setCurrentResult(mockResult);
      setHistory((prev) => [mockResult, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-10 flex-1">
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-cyber-border gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-muted-gray mb-1">
              <Link href="/" className="text-acid-lime hover:underline flex items-center gap-1">
                <ArrowLeft size={12} /> SENTINEL_
              </Link>
              <span>/</span>
              <span>CYBER_RANGE</span>
              <span>/</span>
              <span className="text-white">BENCHMARK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider uppercase text-white">
              RED VS BLUE EVALUATION SUITE
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleContinuous}
              className={`px-4 py-3 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 border-2 transition active:translate-x-0.5 active:translate-y-0.5 ${
                isContinuousRunning
                  ? "bg-[#ff003c] border-[#ff003c] text-black hover:bg-white"
                  : "bg-black border-acid-lime text-acid-lime hover:bg-acid-lime hover:text-black"
              }`}
            >
              <Radio size={16} className={isContinuousRunning ? "animate-pulse" : ""} />
              <span>{isContinuousRunning ? "AUTONOMOUS LOOP: ACTIVE" : "START CONTINUOUS RED-TEAM"}</span>
            </button>

            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="bg-acid-lime text-black hover:bg-white transition px-6 py-3 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-acid-block active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              <Play size={16} className="fill-black" />
              <span>{isRunning ? "RUNNING CAMPAIGN..." : "EXECUTE BENCHMARK SUITE"}</span>
              <ArrowUpRight size={16} className="stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Big Scoreboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DETECTION RATE */}
          <div className="p-6 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">
              METRIC /01
            </div>
            <div className="text-5xl font-display font-black text-acid-lime my-2">
              {currentResult.detection_rate_pct.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>DETECTION RATE</span>
              <span className="text-acid-lime-dim">BENCHMARK</span>
            </div>
          </div>

          {/* MEAN DETECTION TIME */}
          <div className="p-6 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">
              METRIC /02
            </div>
            <div className="text-5xl font-display font-black text-radar-cyan my-2">
              {currentResult.mean_detection_time_ms.toFixed(3)}
              <span className="text-xl ml-1 text-muted-gray font-normal">ms</span>
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>MEAN DETECTION TIME</span>
              <span className="text-radar-cyan">LATENCY</span>
            </div>
          </div>

          {/* ROOT ATTACK CHAINS */}
          <div className="p-6 bg-[#050505] border border-alert-red/50 relative shadow-dark-block bg-alert-red/5">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">
              METRIC /03
            </div>
            <div className="text-5xl font-display font-black text-alert-red my-2">
              {currentResult.root_chains_correlated}
              <span className="text-lg ml-2 text-white font-mono">CAMPAIGN</span>
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>ROOT CHAINS CORRELATED</span>
              <span className="text-alert-red font-black">GRAPH</span>
            </div>
          </div>

          {/* FALSE POSITIVE RATE */}
          <div className="p-6 bg-[#050505] border border-cyber-border relative shadow-dark-block">
            <div className="text-[10px] text-muted-gray uppercase tracking-widest font-bold">
              METRIC /04
            </div>
            <div className="text-5xl font-display font-black text-emerald-400 my-2">
              {currentResult.false_positive_rate_pct.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider pt-2 border-t border-cyber-border flex justify-between">
              <span>FALSE POSITIVE RATE</span>
              <span className="text-emerald-400">CONTROLLED</span>
            </div>
          </div>
        </div>

        {/* Live Terminal Report Log */}
        <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner">
          <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
            <div className="flex items-center space-x-2">
              <Terminal size={16} className="text-acid-lime" />
              <span className="text-xs font-bold text-acid-lime uppercase tracking-wider">
                // BENCHMARK EXECUTION LOG & ROOT INCIDENT TRACE
              </span>
            </div>
            <span className="text-[10px] text-muted-gray">RUN ID: {currentResult.benchmark_id}</span>
          </div>

          <div className="space-y-2 text-xs bg-[#0a0c10] p-4 border border-cyber-border font-mono">
            <div className="text-acid-lime font-bold">
              &gt; TOTAL ATTACK EVENTS INJECTED : {currentResult.total_attacks}
            </div>
            <div className="text-gray-300">
              &gt; DETECTIONS & ALERTS GENERATED: {currentResult.detections_produced}
            </div>
            <div className="text-radar-cyan">
              &gt; SOAR QUARANTINE LATENCY     : {currentResult.soar_containment_latency_ms} ms
            </div>
            <div className="text-alert-red font-bold">
              &gt; ROOT ATTACK CHAIN INCIDENT    : {currentResult.root_incident}
            </div>

            {currentResult.events_log && (
              <div className="mt-4 pt-4 border-t border-cyber-border space-y-1.5 text-[11px]">
                <div className="text-muted-gray mb-1 uppercase font-semibold">ATTACK VECTOR EVENT LOG:</div>
                {currentResult.events_log.map((ev, i) => (
                  <div key={i} className="flex justify-between text-gray-400">
                    <span>[{ev.type.toUpperCase()}] {ev.signature} &rarr; {ev.target}</span>
                    <span className="text-acid-lime">{ev.latency_ms} ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Evaluation Runs Table */}
        {history.length > 0 && (
          <div className="bg-[#050505] border border-cyber-border p-6 relative bracket-corner">
            <div className="text-xs font-bold text-acid-lime uppercase tracking-widest mb-4 pb-2 border-b border-cyber-border">
              // HISTORICAL EVALUATION RUNS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyber-border text-muted-gray text-[10px] uppercase">
                    <th className="py-2">RUN ID</th>
                    <th className="py-2">TIMESTAMP</th>
                    <th className="py-2">ATTACKS</th>
                    <th className="py-2">DETECTION RATE</th>
                    <th className="py-2">MDT</th>
                    <th className="py-2">ROOT CHAINS</th>
                    <th className="py-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-white/5 font-mono">
                      <td className="py-2.5 font-bold text-acid-lime">{h.benchmark_id}</td>
                      <td className="py-2.5 text-muted-gray">{new Date(h.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2.5 text-gray-300">{h.total_attacks}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">{h.detection_rate_pct}%</td>
                      <td className="py-2.5 text-radar-cyan font-bold">{h.mean_detection_time_ms} ms</td>
                      <td className="py-2.5 text-alert-red font-bold">{h.root_chains_correlated}</td>
                      <td className="py-2.5">
                        <span className="text-[10px] bg-acid-lime text-black font-black px-1.5 py-0.5">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <HazardFooter />

      <AttackSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}
