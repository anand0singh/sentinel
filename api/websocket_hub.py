"""
FastAPI WebSocket Connection Hub
Streams real-time alerts and forensic indicators directly to connected SOC analysts.
"""
import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger("Sentinel-WSHub")


class WebSocketHub:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"SOC Dashboard connected via WebSocket. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"SOC Dashboard disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(alert_data)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)


ws_hub = WebSocketHub()
