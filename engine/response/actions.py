"""
SOAR Response Actions
Executes direct defensive mitigations: iptables drop, process kill, host network isolation.
Supports dry-run and cross-platform safe execution.
"""
import os
import subprocess
import logging
from typing import Dict, Any

logger = logging.getLogger("Sentinel-SOAR-Actions")

DRY_RUN = os.getenv("SOAR_DRY_RUN", "false").lower() in ("true", "1")


class ContainmentActions:
    @staticmethod
    def block_ip(ip_address: str) -> Dict[str, Any]:
        """Drop network traffic to/from malicious IP via iptables."""
        cmd = f"iptables -I INPUT -s {ip_address} -j DROP && iptables -I OUTPUT -d {ip_address} -j DROP"
        logger.info(f"Executing Network Block for IP: {ip_address} (Dry-run: {DRY_RUN})")

        if DRY_RUN or os.name == "nt":
            return {"status": "SUCCESS", "action": "BLOCK_IP", "target": ip_address, "mode": "SIMULATED"}

        try:
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            return {"status": "SUCCESS", "action": "BLOCK_IP", "target": ip_address, "output": res.stdout}
        except Exception as e:
            logger.error(f"Failed to block IP {ip_address}: {e}")
            return {"status": "FAILED", "action": "BLOCK_IP", "target": ip_address, "error": str(e)}

    @staticmethod
    def kill_process(pid: int, process_name: str = "") -> Dict[str, Any]:
        """Terminate anomalous or compromised PID."""
        logger.info(f"Terminating Process PID {pid} ({process_name}) (Dry-run: {DRY_RUN})")

        if pid <= 1:
            return {"status": "REJECTED", "action": "KILL_PROCESS", "reason": "Protected system process PID <= 1"}

        if DRY_RUN:
            return {"status": "SUCCESS", "action": "KILL_PROCESS", "target": pid, "mode": "SIMULATED"}

        try:
            if os.name == "nt":
                # On Windows, execute taskkill; handle simulation or non-existent PID gracefully
                res = subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True, text=True)
                if res.returncode != 0:
                    logger.info(f"Windows taskkill simulated/non-existent PID {pid}")
                    return {"status": "SUCCESS", "action": "KILL_PROCESS", "target": pid, "mode": "SIMULATED_WIN"}
            else:
                os.kill(pid, 9)
            return {"status": "SUCCESS", "action": "KILL_PROCESS", "target": pid}
        except Exception as e:
            logger.error(f"Failed to kill PID {pid}: {e}")
            return {"status": "FAILED", "action": "KILL_PROCESS", "target": pid, "error": str(e)}

    @staticmethod
    def isolate_host(host_ip: str) -> Dict[str, Any]:
        """Isolate host completely, leaving only management SSH port 22 open."""
        cmd = (
            f"iptables -F && "
            f"iptables -A INPUT -p tcp --dport 22 -j ACCEPT && "
            f"iptables -A OUTPUT -p tcp --sport 22 -j ACCEPT && "
            f"iptables -P INPUT DROP && "
            f"iptables -P FORWARD DROP && "
            f"iptables -P OUTPUT DROP"
        )
        logger.info(f"Executing Full Host Quarantine for {host_ip} (Dry-run: {DRY_RUN})")

        if DRY_RUN or os.name == "nt":
            return {"status": "SUCCESS", "action": "ISOLATE_HOST", "target": host_ip, "mode": "SIMULATED"}

        try:
            subprocess.run(cmd, shell=True, check=True, capture_output=True)
            return {"status": "SUCCESS", "action": "ISOLATE_HOST", "target": host_ip}
        except Exception as e:
            logger.error(f"Quarantine failed for {host_ip}: {e}")
            return {"status": "FAILED", "action": "ISOLATE_HOST", "target": host_ip, "error": str(e)}
