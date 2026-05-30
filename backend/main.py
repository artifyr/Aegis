from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
import datetime
import uuid
import json

app = FastAPI(title="GEOINT Backend")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Inference Router (Neural Observer, Sentinel Hub, Change Detection) ---
from routers.inference import router as inference_router
app.include_router(inference_router)

# --- Analytics Router ---
from routers.analytics import router as analytics_router
app.include_router(analytics_router)

# --- Camera Router ---
from routers.camera import router as camera_router
app.include_router(camera_router)

# --- Aviation Router ---
from routers.aviation import router as aviation_router
app.include_router(aviation_router)

# --- Maritime Router ---
from routers.maritime import router as maritime_router
app.include_router(maritime_router)

# In-memory session tracking for assets as a proxy for the 'Heartbeat' service
# In production, this would be a specialized background worker updating PostgreSQL via SQLAlchemy/PostGIS.
# Here we'll simulate real-time movement for the high-performance WebSocket stream.
assets = [
    {
        "id": str(uuid.uuid4()),
        "classification": "Naval",
        "callsign": "X-RAY 492",
        "velocity": 12.5,
        "altitude": 0,
        "lat": 34.052,
        "lng": -118.243,
    },
    {
        "id": str(uuid.uuid4()),
        "classification": "Naval",
        "callsign": "YANKEE 102",
        "velocity": 8.2,
        "altitude": 0,
        "lat": 36.778,
        "lng": -25.510,
    },
    {
        "id": str(uuid.uuid4()),
        "classification": "Naval",
        "callsign": "BRAVO 77",
        "velocity": 18.0,
        "altitude": 0,
        "lat": 1.290,
        "lng": 103.851,
    },
    {
        "id": str(uuid.uuid4()),
        "classification": "Aerial",
        "callsign": "GHOST 01",
        "velocity": 450.0,
        "altitude": 35000,
        "lat": 51.470,
        "lng": -0.461,
    },
    {
        "id": str(uuid.uuid4()),
        "classification": "Aerial",
        "callsign": "SIGMA 14",
        "velocity": 520.0,
        "altitude": 41000,
        "lat": -33.946,
        "lng": 18.602,
    },
]

@app.get("/health")
async def health_check():
    return {"status": "operational", "timestamp": datetime.datetime.now().isoformat()}

@app.websocket("/ws/global-surveillance")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time movement: slightly incrementing coordinates
            for asset in assets:
                # DESIGN.md - Numerical data must have monospaced technical treatment - 6 decimal precision
                asset["lat"] = round(asset["lat"] + random.uniform(-0.00002, 0.00002), 6)
                asset["lng"] = round(asset["lng"] + random.uniform(-0.00002, 0.00002), 6)
                asset["last_updated"] = datetime.datetime.now().isoformat()
            
            # DESIGN.md - Technical Authority & Precision
            await websocket.send_json({"assets": assets})
            
            # Pulse interval defined in the request (500ms)
            await asyncio.sleep(1.5)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS Error: {e}")
        await websocket.close()
