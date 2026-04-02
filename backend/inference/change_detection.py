"""
Change Detection Module
Compares two consecutive inference results to flag "New Signatures"
with elevated visual priority in the System Alerts feed.
Uses spatial overlap (IoU) to match detections between scans.
"""

import uuid
import datetime
from typing import List, Tuple


def compute_iou(box_a: list, box_b: list) -> float:
    """Compute Intersection-over-Union between two [x1, y1, x2, y2] boxes."""
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection

    return intersection / union if union > 0 else 0.0


def compare_scans(
    previous_scan: dict,
    current_scan: dict,
    iou_threshold: float = 0.3,
) -> dict:
    """
    Compare two consecutive inference scan results to identify:
      - NEW: Detections in current that have no spatial match in previous
      - MOVED: Detections that spatially match but shifted position
      - GONE: Detections in previous that disappeared from current

    Args:
        previous_scan: Result dict from NeuralObserver.run_inference()
        current_scan: Result dict from NeuralObserver.run_inference()
        iou_threshold: Minimum IoU to consider two detections as the same object.

    Returns:
        A change report dict with:
          - "change_id": str (UUID)
          - "timestamp": str (ISO-8601)
          - "previous_scan_id": str
          - "current_scan_id": str
          - "new_signatures": list of detections (HIGH PRIORITY)
          - "moved_assets": list of {previous, current, displacement}
          - "gone_assets": list of detections
          - "alerts": list of formatted alert objects for the System Alerts feed
    """
    prev_hvt = previous_scan.get("high_value_targets", [])
    curr_hvt = current_scan.get("high_value_targets", [])

    matched_prev = set()
    matched_curr = set()
    moved_assets = []

    # Match detections between scans via IoU
    for ci, c_det in enumerate(curr_hvt):
        best_iou = 0.0
        best_pi = -1

        for pi, p_det in enumerate(prev_hvt):
            if pi in matched_prev:
                continue
            iou = compute_iou(c_det["bbox"], p_det["bbox"])
            if iou > best_iou:
                best_iou = iou
                best_pi = pi

        if best_iou >= iou_threshold and best_pi >= 0:
            matched_prev.add(best_pi)
            matched_curr.add(ci)

            # Compute displacement
            p_cx = (prev_hvt[best_pi]["bbox"][0] + prev_hvt[best_pi]["bbox"][2]) / 2
            p_cy = (prev_hvt[best_pi]["bbox"][1] + prev_hvt[best_pi]["bbox"][3]) / 2
            c_cx = (c_det["bbox"][0] + c_det["bbox"][2]) / 2
            c_cy = (c_det["bbox"][1] + c_det["bbox"][2]) / 2
            displacement = ((c_cx - p_cx) ** 2 + (c_cy - p_cy) ** 2) ** 0.5

            moved_assets.append({
                "previous": prev_hvt[best_pi],
                "current": c_det,
                "displacement_px": round(displacement, 2),
            })

    # New signatures: current detections not matched to any previous
    new_signatures = [
        curr_hvt[i] for i in range(len(curr_hvt)) if i not in matched_curr
    ]

    # Gone assets: previous detections not matched to any current
    gone_assets = [
        prev_hvt[i] for i in range(len(prev_hvt)) if i not in matched_prev
    ]

    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    # Generate formatted alerts for the System Alerts feed
    alerts = _generate_alerts(new_signatures, moved_assets, gone_assets, timestamp)

    return {
        "change_id": str(uuid.uuid4()),
        "timestamp": timestamp,
        "previous_scan_id": previous_scan.get("scan_id", ""),
        "current_scan_id": current_scan.get("scan_id", ""),
        "new_signatures": new_signatures,
        "moved_assets": moved_assets,
        "gone_assets": gone_assets,
        "summary": {
            "new_count": len(new_signatures),
            "moved_count": len(moved_assets),
            "gone_count": len(gone_assets),
        },
        "alerts": alerts,
    }


def _generate_alerts(
    new_sigs: list,
    moved: list,
    gone: list,
    timestamp: str,
) -> list:
    """
    Format change detections into System Alert objects styled per DESIGN.md:
      - New Signatures → CRITICAL priority (on-tertiary-container border, glow gradient)
      - Moved Assets → INFO priority (secondary border)
      - Gone Assets → WARNING priority (outline border)
    """
    alerts = []

    for sig in new_sigs:
        alerts.append({
            "alert_id": str(uuid.uuid4()),
            "timestamp": timestamp,
            "priority": "CRITICAL",
            "title": "NEW SIGNATURE DETECTED",
            "message": (
                f"{sig['classification'].upper()} — CONFIDENCE: {sig['confidence']:.1%} "
                f"— BBOX: [{', '.join(f'{c:.2f}' for c in sig['bbox'])}]"
            ),
            "classification": sig["classification"],
            "confidence": sig["confidence"],
            "border_color": "on-tertiary-container",  # #c31f29
            "glow": True,  # Triggers Instrumentation Glow gradient on frontend
        })

    for m in moved:
        alerts.append({
            "alert_id": str(uuid.uuid4()),
            "timestamp": timestamp,
            "priority": "INFO",
            "title": "ASSET DISPLACEMENT",
            "message": (
                f"{m['current']['classification'].upper()} shifted "
                f"{m['displacement_px']:.1f}px between scans."
            ),
            "classification": m["current"]["classification"],
            "confidence": m["current"]["confidence"],
            "border_color": "secondary",  # #7bd6d1
            "glow": False,
        })

    for g in gone:
        alerts.append({
            "alert_id": str(uuid.uuid4()),
            "timestamp": timestamp,
            "priority": "WARNING",
            "title": "SIGNAL LOST",
            "message": (
                f"{g['classification'].upper()} — last seen at "
                f"[{', '.join(f'{c:.2f}' for c in g['bbox'])}]. "
                f"CONFIDENCE WAS {g['confidence']:.1%}."
            ),
            "classification": g["classification"],
            "confidence": g["confidence"],
            "border_color": "outline",  # #859491
            "glow": False,
        })

    # Sort: CRITICAL first, then WARNING, then INFO
    priority_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    alerts.sort(key=lambda a: priority_order.get(a["priority"], 99))

    return alerts
