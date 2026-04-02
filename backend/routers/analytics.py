"""
Analytics API Router
Exposes real-time and historical analytics data from
the heartbeat service and inference pipeline.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary():
    """
    Returns a snapshot of system-wide analytics:
    classification counts, velocity distributions,
    and simulated historical trend data.
    """
    from main import assets

    # Classification breakdown
    classification_counts = {}
    total_velocity = 0
    max_velocity = 0
    for a in assets:
        cls = a["classification"]
        classification_counts[cls] = classification_counts.get(cls, 0) + 1
        total_velocity += a["velocity"]
        if a["velocity"] > max_velocity:
            max_velocity = a["velocity"]

    avg_velocity = round(total_velocity / len(assets), 2) if assets else 0

    # Simulated 30-day detection trend (for the histogram)
    import random
    trend_data = []
    base = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    for i in range(30):
        day = base + datetime.timedelta(days=i)
        trend_data.append({
            "date": day.strftime("%Y-%m-%d"),
            "naval": random.randint(3, 18),
            "aerial": random.randint(5, 22),
        })

    # Simulated sector threat confidence
    sectors = [
        {"id": "SECTOR_1", "confidence": round(random.uniform(85, 99.9), 1), "status": "NOMINAL"},
        {"id": "SECTOR_2", "confidence": round(random.uniform(30, 60), 1), "status": "DEGRADED"},
        {"id": "SECTOR_3", "confidence": round(random.uniform(75, 95), 1), "status": "NOMINAL"},
        {"id": "SECTOR_4", "confidence": round(random.uniform(90, 99), 1), "status": "NOMINAL"},
        {"id": "SECTOR_5", "confidence": round(random.uniform(15, 45), 1), "status": "CRITICAL"},
        {"id": "SECTOR_6", "confidence": round(random.uniform(60, 85), 1), "status": "NOMINAL"},
    ]

    return JSONResponse(content={
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "total_assets": len(assets),
        "classification_counts": classification_counts,
        "avg_velocity_kts": avg_velocity,
        "max_velocity_kts": max_velocity,
        "trend_30d": trend_data,
        "sectors": sectors,
        "system": {
            "uptime_pct": 99.97,
            "latency_ms": round(random.uniform(8, 18), 1),
            "ws_connections": 1,
            "inference_scans_24h": random.randint(12, 48),
        },
    })
