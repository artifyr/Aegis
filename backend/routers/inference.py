"""
Inference API Router
Exposes the Neural Observer, Sentinel Hub adapter, and Change Detection
as REST endpoints for the GEOINT frontend.
"""

from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import JSONResponse
from typing import Optional

from inference.service import NeuralObserver
from inference.sentinel_hub import SentinelHubAdapter
from inference.change_detection import compare_scans

router = APIRouter(prefix="/api/inference", tags=["inference"])

# Singletons
observer = NeuralObserver(model_path=None, confidence_threshold=0.45)
sentinel = SentinelHubAdapter()

# In-memory scan history for change detection (latest 2 scans)
_scan_history: list = []


@router.post("/detect")
async def detect_targets(
    image: UploadFile = File(...),
    chip_size: int = Query(640, ge=256, le=1280),
):
    """
    Accept a GeoTIFF or high-resolution PNG.
    Partition into tactical chips. Run YOLOv11 inference.
    Return detected High-Value Targets.
    """
    image_bytes = await image.read()
    result = observer.run_inference(image_bytes, chip_size=chip_size)

    # Store for change detection
    _scan_history.append(result)
    if len(_scan_history) > 2:
        _scan_history.pop(0)

    return JSONResponse(content=result)


@router.post("/detect-and-compare")
async def detect_and_compare(
    image: UploadFile = File(...),
    chip_size: int = Query(640, ge=256, le=1280),
):
    """
    Run inference AND compare against the previous scan.
    Returns both detection results and change detection alerts.
    """
    image_bytes = await image.read()
    current_scan = observer.run_inference(image_bytes, chip_size=chip_size)

    change_report = None
    if len(_scan_history) > 0:
        change_report = compare_scans(_scan_history[-1], current_scan)

    # Update history
    _scan_history.append(current_scan)
    if len(_scan_history) > 2:
        _scan_history.pop(0)

    return JSONResponse(content={
        "scan": current_scan,
        "change_report": change_report,
    })


@router.get("/timeline")
async def get_timeline(
    lat: float = Query(34.05, description="AOI center latitude"),
    lng: float = Query(-118.24, description="AOI center longitude"),
    start_date: str = Query("2023-09-01", description="Start date ISO-8601"),
    end_date: str = Query("2023-10-24", description="End date ISO-8601"),
):
    """
    Query available satellite acquisitions for the Timeline Scrubber.
    Returns a list of available dates with satellite and cloud cover info.
    """
    acquisitions = sentinel.get_timeline_acquisitions(lat, lng, start_date, end_date)
    return JSONResponse(content={"acquisitions": acquisitions})


@router.post("/timeline/fetch")
async def fetch_timeline_imagery(
    lat: float = Query(34.05),
    lng: float = Query(-118.24),
    date: str = Query("2023-10-24"),
    width: int = Query(1280, ge=256, le=4096),
    height: int = Query(1280, ge=256, le=4096),
):
    """
    Fetch imagery for a specific date from the Sentinel Hub mock adapter,
    run inference on it, and return detections.
    Used when the user interacts with the Scrub Timeline.
    """
    fetch_result = sentinel.fetch_imagery(lat, lng, date, width, height)
    image_bytes = fetch_result["image_bytes"]

    scan_result = observer.run_inference(image_bytes, chip_size=640)

    # Change detection against previous
    change_report = None
    if len(_scan_history) > 0:
        change_report = compare_scans(_scan_history[-1], scan_result)

    _scan_history.append(scan_result)
    if len(_scan_history) > 2:
        _scan_history.pop(0)

    # Remove raw image bytes from response
    meta = {k: v for k, v in fetch_result.items() if k != "image_bytes"}

    return JSONResponse(content={
        "acquisition": meta,
        "scan": scan_result,
        "change_report": change_report,
    })
