"""
Sentinel Core Consumer & Real-Time Processing Pipeline
Pulls ECS telemetry from Kafka, performs GeoIP and Threat Intel enrichment,
runs detection engines, tracks kill chains, updates ClickHouse, and notifies SOAR.
"""
import os
import json
import time
import logging
from typing import Dict, Any

from engine.ingest.normalizer import ECSNormalizer
from engine.enrichment.geoip import GeoIPService
from engine.enrichment.threat_intel import ThreatIntelEngine
from engine.detectors.signature import SignatureEngine
from engine.detectors.anomaly_detector import AnomalyDetector
from engine.detectors.attack_chain import AttackChainCorrelator
from engine.response.orchestrator import ResponseOrchestrator
from engine.storage.clickhouse_client import ClickHouseClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("Sentinel-Pipeline")

KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPICS = ["telemetry-network", "telemetry-endpoint"]


class SentinelPipeline:
    def __init__(self):
        self.threat_intel = ThreatIntelEngine()
        self.signature_detector = SignatureEngine()
        self.anomaly_detector = AnomalyDetector()
        self.attack_correlator = AttackChainCorrelator()
        self.soar = ResponseOrchestrator()
        self.storage = ClickHouseClient()
        self.consumer = None

    def _init_kafka_consumer(self):
        try:
            from kafka import KafkaConsumer
            self.consumer = KafkaConsumer(
                *TOPICS,
                bootstrap_servers=KAFKA_SERVERS.split(","),
                group_id=os.getenv("KAFKA_CONSUMER_GROUP", "sentinel-core-pipeline"),
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="latest",
                enable_auto_commit=True,
                consumer_timeout_ms=1000,
            )
            logger.info(f"Kafka consumer subscribed to topics: {TOPICS}")
        except Exception as e:
            logger.warning(f"Kafka unavailable ({e}). Pipeline standing by for direct injection.")
            self.consumer = None

    def process_event(self, raw_data: Dict[str, Any], event_type: str = "network"):
        """Run single event through complete enrichment, detection, and mitigation loop."""
        # 1. Normalization
        event = ECSNormalizer.process(event_type, raw_data)
        if not event:
            return

        # 2. GeoIP & Threat Intel Enrichment
        geo = GeoIPService.lookup(event.get("destination_ip", "0.0.0.0"))
        event["geo_country"] = geo.get("country_iso", "ZZ")
        event = self.threat_intel.enrich_event(event)

        # 3. Store raw event batch
        self.storage.insert_events([event])

        # 4. Multi-Layer Detection
        alert = None
        if event_type == "endpoint":
            alert = self.signature_detector.evaluate_endpoint(event)
        else:
            alert = self.signature_detector.evaluate_network(event)

        # 4b. Anomaly Detection (Volumetric + Beaconing)
        if not alert and event.get("destination_ip"):
            alert = self.anomaly_detector.inspect_beaconing(
                event.get("source_ip", ""), event.get("destination_ip", "")
            )
            if not alert:
                alert = self.anomaly_detector.inspect_payload_anomaly(event)

        # 5. Attack-Chain Graph Correlation & SOAR
        if alert:
            logger.info(f"[DETECTION] {alert.get('severity')} - {alert.get('title')}")
            self.storage.insert_alert(alert)
            self.soar.handle_alert(alert)

            # Check if this alert completes a multi-stage attack chain
            chain_alert = self.attack_correlator.ingest_alert(alert)
            if chain_alert:
                logger.critical(f"[ATTACK-CHAIN] {chain_alert['title']}")
                self.storage.insert_alert(chain_alert)
                self.soar.handle_alert(chain_alert)

    def start(self):
        logger.info("SENTINEL Real-time Processing Pipeline started.")
        self._init_kafka_consumer()

        while True:
            if self.consumer:
                try:
                    for msg in self.consumer:
                        topic = msg.topic
                        ev_type = "endpoint" if "endpoint" in topic else "network"
                        self.process_event(msg.value, ev_type)
                except Exception as e:
                    logger.error(f"Error reading from Kafka: {e}")
                    time.sleep(2)
            else:
                time.sleep(1)


if __name__ == "__main__":
    pipeline = SentinelPipeline()
    pipeline.start()
