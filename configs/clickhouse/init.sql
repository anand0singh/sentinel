-- ClickHouse High-Performance Security Event Schema for SENTINEL
CREATE DATABASE IF NOT EXISTS sentinel;

-- Raw Normalized Telemetry Events Table
CREATE TABLE IF NOT EXISTS sentinel.sentinel_events
(
    timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    event_category LowCardinality(String),
    event_dataset LowCardinality(String),
    source_ip IPv4,
    source_port UInt16,
    destination_ip IPv4,
    destination_port UInt16,
    network_protocol LowCardinality(String),
    process_name LowCardinality(String),
    process_pid UInt32,
    process_parent_pid UInt32,
    process_command_line String,
    user_name LowCardinality(String),
    threat_matched UInt8 DEFAULT 0,
    threat_score Float32 DEFAULT 0.0,
    geo_country LowCardinality(String) DEFAULT 'ZZ',
    raw_payload String
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, event_category, destination_ip, source_ip)
SETTINGS index_granularity = 8192;

-- Correlated Attack & Detection Alerts Table
CREATE TABLE IF NOT EXISTS sentinel.sentinel_alerts
(
    alert_id UUID DEFAULT generateUUIDv4(),
    timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    title String,
    severity LowCardinality(String),
    mitre_tactic LowCardinality(String),
    mitre_technique LowCardinality(String),
    source_ip IPv4,
    destination_ip IPv4,
    process_name LowCardinality(String),
    attack_chain_stage LowCardinality(String),
    confidence Float32,
    description String,
    forensic_payload String,
    containment_status LowCardinality(String) DEFAULT 'PENDING'
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (timestamp, severity, alert_id)
SETTINGS index_granularity = 8192;
