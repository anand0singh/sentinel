"""
SENTINEL FastAPI Application
Core entry point for the REST API and WebSocket notification pipeline.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.routers.alerts import router as alerts_router
from api.routers.containment import router as containment_router
from api.routers.forensics import forensics_router
from api.routers.telemetry import telemetry_router, telem_hub, get_current_vitals
from api.routers.range import router as range_router
from api.routers.playbooks import router as playbooks_router
from api.routers.intel import router as intel_router
from api.routers.topology import router as topology_router
from api.routers.copilot import router as copilot_router
from api.routers.endpoints import router as endpoints_router
from api.routers.canary import router as canary_router
from api.websocket_hub import ws_hub
import asyncio

app = FastAPI(
    title="SENTINEL Autonomous Cyber Defense Platform",
    description="Autonomous detection, correlation, and automated SOAR containment platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts_router, prefix="/api/v1")
app.include_router(containment_router, prefix="/api/v1")
app.include_router(forensics_router, prefix="/api/v1")
app.include_router(telemetry_router, prefix="/api/v1")
app.include_router(range_router, prefix="/api/v1")
app.include_router(playbooks_router, prefix="/api/v1")
app.include_router(intel_router, prefix="/api/v1")
app.include_router(topology_router, prefix="/api/v1")
app.include_router(copilot_router, prefix="/api/v1")
app.include_router(endpoints_router, prefix="/api/v1")
app.include_router(canary_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"platform": "SENTINEL", "status": "ONLINE", "docs": "/docs"}


@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await ws_hub.connect(websocket)
    try:
        while True:
            # Keep-alive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect(websocket)


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await telem_hub.connect(websocket)
    try:
        while True:
            vitals = get_current_vitals()
            await websocket.send_json(vitals)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        telem_hub.disconnect(websocket)
    except Exception:
        telem_hub.disconnect(websocket)
