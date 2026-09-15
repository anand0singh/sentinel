"""
Threat Intelligence & Bloom Filter Router (Phase 2)
Provides endpoints for Bloom Filter capacity telemetry, active threat feeds,
and instant IOC reputation scoring.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from engine.enrichment.threat_intel import ThreatIntelEngine

router = APIRouter(prefix="/intel", tags=["Threat Intelligence"])

intel_engine = ThreatIntelEngine()


class LookupRequest(BaseModel):
    ioc: str  # IP, domain, or SHA256 hash


class SyncRequest(BaseModel):
    feed_name: str


@router.get("/stats")
def get_intel_stats():
    """Retrieve live Bloom Filter telemetry, bitset density, and capacity metrics."""
    return intel_engine.get_bloom_stats()


@router.get("/feeds")
def list_feeds():
    """Returns subscribed threat feeds (AlienVault, MISP, URLhaus, ET Open)."""
    return {"feeds": intel_engine.get_feeds()}


@router.post("/lookup")
def lookup_ioc(req: LookupRequest):
    """Instant reputation lookup for an IP, domain, or hash against Bloom Filter & cache."""
    result = intel_engine.query(req.ioc)
    if not result:
        return {
            "ioc": req.ioc,
            "status": "CLEAN",
            "threat_score": 0.0,
            "details": "No indicators found in Bloom Filter or threat intelligence cache.",
            "source": "BLOOM_FILTER_ZERO_MISS",
        }
    return {
        "ioc": req.ioc,
        "status": "MALICIOUS",
        "threat_score": result.get("score", 90.0),
        "threat_type": result.get("threat", "Unknown"),
        "family": result.get("family", "Generic"),
        "source": "ALIENVAULT_OTX_BLOOM_HIT",
    }


@router.post("/sync")
def sync_feed(req: SyncRequest):
    """Trigger manual or scheduled pull of latest IOCs into Bloom Filter."""
    res = intel_engine.sync_feed(req.feed_name)
    return res
