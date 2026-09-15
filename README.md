# ⚡ SENTINEL // Autonomous Cyber Defense Platform

> **Real-time threat detection, multi-stage kill-chain graph correlation, and automated SOAR zero-trust containment.**

---

## 🛰️ Architectural Overview

```
                                [ EXTERNAL ATTACK VECTORS ]
                                             │
                                    ┌────────▼────────┐
                                    │ PFSENSE / AF_XDP│
                                    └────────┬────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │               MIRROR / TAP                │
                       ▼                                           ▼
             [ SURICATA / ZEELOGS ]                         [ ENDPOINTS ]
             (Layer 3/4/7 Deep Packet)                      (Linux / Windows)
                       │                                           │
                       │ JSON / EVE / Syscall Stream               │ eBPF / ETW
                       ▼                                           ▼
             ┌─────────────────────────────────────────────────────────────┐
             │               VECTOR ECS AGGREGATION PIPELINE               │
             └──────────────────────────────┬──────────────────────────────┘
                                            ▼
                               [ KAFKA MESSAGE BROKER ]
                               (telemetry-network / -endpoint)
                                            │
                                            ▼
                                  [ SENTINEL CORE ENGINE ]
                     ┌──────────────────────┼──────────────────────┐
                     │                      │                      │
                     ▼                      ▼                      ▼
             [ SIGNATURE DPI ]      [ ISOLATION FOREST ]   [ NETWORKX GRAPH ]
             (Suricata / ET-Open)   (Zero-Day Anomaly)     (Kill-Chain Trace)
                     │                      │                      │
                     └──────────────────────┼──────────────────────┘
                                            ▼
                                 [ CLICKHOUSE / REDIS ]
                                 (Fast Forensic Storage)
                                            │
                                            ▼
                                 [ AUTONOMOUS SOAR ]
                                 (Host Sever / C2 Block / Token Revoke)
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
            [ CYBER BRUTALISM HUD ]                     [ AI SOC COPILOT ]
            (Next.js 14 / WebSockets)                   (Root-Cause Synthesis)
```

---

## ⚡ Core Pillars & Capabilities

- **Cyber Brutalism Command Center**: High-contrast UI (`#050505` obsidian canvas, `#d4ff00` high-voltage acid lime, hazard stripes, 3D holographic matrix, and ASCII segmented telemetry meters).
- **Multi-Stage Attack Chain Correlation**: Dynamic sliding-window graph correlation powered by `networkx` tracking progression through MITRE ATT&CK stages (Recon -> Exploit -> Reverse Shell -> C2 -> Exfil).
- **Zero-Trust SOAR & Automated Playbooks**: Autonomous host quarantine, C2 sinkholing, and one-click immutable state rollback.
- **Wireshark-Grade Deep Packet Inspector**: Live Community-ID flow stream, protocol header tree, raw hexadecimal memory inspection with ASCII translation, and binary `.pcap` export.
- **High-Performance Threat Intelligence**: Counting Bloom filter bitset representation with sub-microsecond IOC queries and multi-source feed synchronization (AlienVault OTX, CISA KEV, AbuseIPDB).
- **Attack Topology Radar**: Dynamic network graph visualizer tracking lateral movement hops and calculating blast radius potential across subnets.
- **Autonomous AI SOC Co-Pilot**: Root-cause synthesis, natural-language threat hunting queries, and auto-generated drop-in remediation scripts (Bash & PowerShell).
- **Endpoint Fleet Matrix**: Fleet manager tracking Linux/Windows endpoints with live eBPF kernel syscall probes (`sys_enter_execve`, `security_socket_connect`, `etw_credential_access`).
- **Deception Honey-Token Canary Mesh**: Deception traps (Honey AWS keys, fake SSH ports, bogus DB passwords, FIM bait files) with guaranteed 0% false-positive auto-containment triggers.
- **Cyber Range Red-vs-Blue Benchmark**: Multi-vector attack evaluation suite with automated continuous training runner.

---

## 🛠️ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. One-Click Launch (Windows)
```cmd
start_all.bat
```
*Automatically clears any port conflicts on 8000 & 3000, starts the FastAPI core backend, launches the Next.js dashboard, and opens `http://localhost:3000` in your default browser.*

### 2. Manual Startup

**FastAPI Core API:**
```bash
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

**Next.js Cyber Brutalism Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

Dashboard will be live at `http://localhost:3000`. API docs available at `http://localhost:8000/docs`.

---

## 🧪 Automated Verification Suite

Run all 37 comprehensive unit, integration, and security tests:

```bash
# On Windows:
run_tests.bat
# Or manually:
pytest tests/ -v
```

---

## 🧭 Navigation Map

| View | Route | Description |
| :--- | :--- | :--- |
| **Command HUD** | `/` | 3D wireframe sphere, DEFCON status, live alerts, ASCII telemetry |
| **Attack Topology** | `/topology` | NetworkX lateral movement graph & blast-radius calculator |
| **AI SOC Co-Pilot** | `/copilot` | Natural-language threat hunter & remediation script generator |
| **Endpoint Fleet** | `/endpoints` | Monitored Linux/Windows hosts & live eBPF kernel event stream |
| **Canary Deception**| `/canary` | Honey-tokens (AWS, SSH, DB, files) with 0% FPR triggers |
| **Cyber Range** | `/benchmark` | Red-vs-Blue evaluation suite & autonomous continuous runner |
| **SOAR Playbooks** | `/playbooks` | Automated response policies & Zero-Trust rollback |
| **Packet Forensics**| `/forensics` | Dissection hierarchy, hex/ASCII dump & binary `.pcap` export |
| **Threat Intel** | `/threat-intel` | Bloom filter radar & multi-feed threat intelligence sync |
| **Alert Triage** | `/alerts` | Historical forensic triage with MITRE filters |
| **Timeline** | `/timeline` | Multi-stage campaign chronology across time windows |

---

## 📜 License
MIT License © 2026 Anand Singh
