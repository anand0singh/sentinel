#!/usr/bin/env bash
# Initialize Kafka Topics for SENTINEL Architecture
set -e

echo "[*] Waiting for Kafka Broker to be ready..."
cub kafka-ready -b kafka:9092 1 30 || true

echo "[*] Creating Sentinel Kafka Topics..."
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists \
  --topic telemetry-network \
  --partitions 3 \
  --replication-factor 1

kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists \
  --topic telemetry-endpoint \
  --partitions 3 \
  --replication-factor 1

kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists \
  --topic telemetry-auth \
  --partitions 2 \
  --replication-factor 1

kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists \
  --topic sentinel-alerts \
  --partitions 2 \
  --replication-factor 1

echo "[+] Successfully provisioned Kafka topics for SENTINEL."
kafka-topics --bootstrap-server kafka:9092 --list
