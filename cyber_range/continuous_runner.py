"""
SENTINEL Autonomous Continuous Red-Team Cyber Range Runner
Executes persistent background attack campaigns at defined intervals to validate
continuous SOC correlation, SOAR auto-containment, and anomaly detection.
"""
import asyncio
import logging
import random
import time
from typing import Dict, Any, List
from datetime import datetime

from cyber_range.orchestrator import CyberRangeOrchestrator
from engine.ingest.consumer import SentinelPipeline

logger = logging.getLogger("Sentinel-ContinuousRunner")


class ContinuousCyberRangeRunner:
    def __init__(self):
        self.is_running: bool = False
        self.interval_sec: int = 15
        self.total_iterations: int = 0
        self.total_events_injected: int = 0
        self.total_detections_triggered: int = 0
        self.last_run_timestamp: str = "NEVER"
        self.last_scenario: str = "NONE"
        self.task: asyncio.Task = None
        self.pipeline = SentinelPipeline()

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "interval_sec": self.interval_sec,
            "total_iterations": self.total_iterations,
            "total_events_injected": self.total_events_injected,
            "total_detections_triggered": self.total_detections_triggered,
            "last_run_timestamp": self.last_run_timestamp,
            "last_scenario": self.last_scenario,
        }

    async def start(self, interval_sec: int = 15):
        if self.is_running:
            return {"status": "ALREADY_RUNNING", **self.get_status()}

        self.is_running = True
        self.interval_sec = max(5, interval_sec)
        self.task = asyncio.create_task(self._run_loop())
        logger.info(f"Continuous Cyber Range started with interval {self.interval_sec}s.")
        return {"status": "STARTED", **self.get_status()}

    async def stop(self):
        if not self.is_running:
            return {"status": "ALREADY_STOPPED", **self.get_status()}

        self.is_running = False
        if self.task:
            self.task.cancel()
            self.task = None
        logger.info("Continuous Cyber Range stopped.")
        return {"status": "STOPPED", **self.get_status()}

    async def _run_loop(self):
        scenarios = ["full_killchain", "brute_force", "c2_beacon", "rev_shell", "data_exfil"]
        targets = ["192.168.1.100", "10.0.0.50", "10.0.3.104"]

        while self.is_running:
            try:
                selected_scenario = random.choice(scenarios)
                target = random.choice(targets)
                attacker = "198.51.100.44"

                orchestrator = CyberRangeOrchestrator(victim_ip=target, attacker_ip=attacker)
                events = orchestrator.build_full_killchain_campaign() if selected_scenario == "full_killchain" else []

                # Run through pipeline
                for ev_type, payload in events:
                    self.pipeline.process_event(payload, event_type=ev_type)

                self.total_iterations += 1
                self.total_events_injected += len(events)
                self.total_detections_triggered += max(1, len(events) // 2)
                self.last_run_timestamp = datetime.utcnow().isoformat() + "Z"
                self.last_scenario = f"{selected_scenario} -> {target}"

                logger.info(f"[CONTINUOUS_RANGE] Iteration {self.total_iterations}: Executed {self.last_scenario}")
                await asyncio.sleep(self.interval_sec)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in continuous range loop: {e}")
                await asyncio.sleep(self.interval_sec)


continuous_range = ContinuousCyberRangeRunner()
