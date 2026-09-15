"""
Sentinel eBPF Probe Loader
Compiles probe.c using BCC and streams kernel-level execution and network events.
"""
import sys
import socket
import struct
import logging
from typing import Callable, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("Sentinel-eBPF-Loader")

try:
    from bcc import BPF
except ImportError:
    BPF = None
    logger.warning("BCC library not found. eBPF loader will run in mock/simulation mode.")


def ip_to_str(addr: int) -> str:
    """Converts 32-bit integer IPv4 to dotted-decimal string."""
    return socket.inet_ntoa(struct.pack("<I", addr))


class EBPFProbeLoader:
    def __init__(self, probe_path: str = "agent/ebpf/probe.c"):
        self.probe_path = probe_path
        self.bpf: Optional[BPF] = None

    def load(self, callback: Callable[[dict], None]):
        """Compile and attach eBPF probe or fallback gracefully."""
        if not BPF:
            logger.info("Operating in standalone/user-space collector mode.")
            return

        with open(self.probe_path, "r") as f:
            src = f.read()

        logger.info("Compiling eBPF probe...")
        self.bpf = BPF(text=src)

        def _handle_event(cpu, data, size):
            event = self.bpf["events"].event(data)
            parsed = {
                "pid": event.pid,
                "ppid": event.ppid,
                "uid": event.uid,
                "type": "EXEC" if event.type == 1 else "CONNECT",
                "comm": event.comm.decode("utf-8", "replace"),
                "filename": event.filename.decode("utf-8", "replace") if event.type == 1 else "",
                "dst_ip": ip_to_str(event.daddr) if event.type == 2 else "0.0.0.0",
                "dst_port": socket.ntohs(event.dport) if event.type == 2 else 0,
            }
            callback(parsed)

        self.bpf["events"].open_perf_buffer(_handle_event)
        logger.info("eBPF probe attached successfully to tracepoints.")

    def poll(self):
        """Poll the perf buffer."""
        if self.bpf:
            self.bpf.perf_buffer_poll()
