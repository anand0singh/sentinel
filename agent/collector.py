"""
Sentinel Endpoint Collector
Streams host process and socket telemetry, normalizes into ECS JSON,
and publishes directly into the Kafka topic: telemetry-endpoint.
"""
import os
import json
import time
import socket
import logging
from datetime import datetime, timezone
from kafka import KafkaProducer
from agent.ebpf.loader import EBPFProbeLoader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("Sentinel-Collector")

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC_ENDPOINT = os.getenv("KAFKA_TOPIC_ENDPOINT", "telemetry-endpoint")
HOSTNAME = socket.gethostname()


class EndpointCollector:
    def __init__(self):
        self.producer = None
        self._init_kafka()
        self.loader = EBPFProbeLoader()

    def _init_kafka(self):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(","),
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks=1,
                retries=3,
            )
            logger.info(f"Connected to Kafka broker at {KAFKA_BOOTSTRAP_SERVERS}")
        except Exception as e:
            logger.warning(f"Kafka connection failed: {e}. Outputting events to stdout.")

    def handle_telemetry_event(self, raw_event: dict):
        """Transform raw probe event to ECS standardized JSON and dispatch."""
        ecs_event = {
            "@timestamp": datetime.now(timezone.utc).isoformat(),
            "event": {
                "category": "endpoint",
                "action": raw_event.get("type", "UNKNOWN"),
                "dataset": "sentinel.ebpf",
            },
            "host": {
                "hostname": HOSTNAME,
            },
            "process": {
                "name": raw_event.get("comm", ""),
                "pid": raw_event.get("pid", 0),
                "parent": {"pid": raw_event.get("ppid", 0)},
                "command_line": raw_event.get("filename", ""),
            },
            "user": {
                "id": str(raw_event.get("uid", 0)),
            },
            "destination": {
                "ip": raw_event.get("dst_ip", "0.0.0.0"),
                "port": raw_event.get("dst_port", 0),
            },
        }

        if self.producer:
            self.producer.send(TOPIC_ENDPOINT, value=ecs_event)
        else:
            logger.debug(f"[TELEMETRY] {json.dumps(ecs_event)}")

    def run(self):
        logger.info("Starting Sentinel Endpoint Collector daemon...")
        self.loader.load(self.handle_telemetry_event)
        try:
            while True:
                self.loader.poll()
                time.sleep(0.01)
        except KeyboardInterrupt:
            logger.info("Collector shutting down.")
            if self.producer:
                self.producer.flush()


if __name__ == "__main__":
    collector = EndpointCollector()
    collector.run()
