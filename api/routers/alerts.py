"""
Alerts Router
API endpoints for listing, filtering, and retrieving security alerts.
"""
from typing import List, Optional
from fastapi import APIRouter, Query
from engine.storage.clickhouse_client import ClickHouseClient

router = APIRouter(prefix="/alerts", tags=["Alerts"])
storage = ClickHouseClient()


@router.get("/")
def get_alerts(
    limit: int = Query(50, ge=1, le=1000),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL")
):
    """Fetch paginated historical and active alerts."""
    alerts = storage.get_recent_alerts(limit=limit)
    if severity:
        alerts = [a for a in alerts if str(a.get("severity")).upper() == severity.upper()]
    return {"status": "success", "count": len(alerts), "alerts": alerts}
