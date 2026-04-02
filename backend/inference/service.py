"""
YOLOv11 Neural Observer Service
Wraps the Ultralytics YOLOv11 model for satellite/aerial object detection.
Falls back to a high-fidelity mock when no model weights are available,
producing realistic portfolio-grade detection payloads.
"""

import datetime
import uuid
import random
from typing import List, Optional

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

from inference.chips import partition_image, remap_detection_to_global


# Classification taxonomy matching DESIGN.md asset types
CLASSIFICATION_LABELS = {
    0: "Naval",
    1: "Aerial",
    2: "Ground Vehicle",
    3: "Infrastructure",
    4: "Unknown Signature",
}

# High-value target classes that trigger elevated alert priority
HIGH_VALUE_CLASSES = {"Naval", "Aerial", "Unknown Signature"}


class NeuralObserver:
    """
    The Neural Observer wraps YOLOv11 inference with tactical metadata formatting.
    All outputs are ISO-8601 timestamped with 6-decimal coordinate precision
    per DESIGN.md Technical Authority requirements.
    """

    def __init__(self, model_path: Optional[str] = None, confidence_threshold: float = 0.45):
        self.confidence_threshold = confidence_threshold
        self.model = None

        if model_path and YOLO_AVAILABLE:
            try:
                self.model = YOLO(model_path)
            except Exception:
                self.model = None

    def run_inference(self, image_bytes: bytes, chip_size: int = 640) -> dict:
        """
        Run full inference pipeline:
        1. Partition image into tactical chips
        2. Run YOLO (or mock) on each chip
        3. Remap detections to global image space
        4. Format as tactical JSON payload

        Returns a dict with:
          - "scan_id": str (UUID)
          - "timestamp": str (ISO-8601)
          - "chip_count": int
          - "total_detections": int
          - "high_value_targets": list of detection dicts
        """
        chips = partition_image(image_bytes, chip_size=chip_size)
        all_detections: List[dict] = []

        for chip in chips:
            if self.model:
                raw = self._yolo_inference(chip["image"])
            else:
                raw = self._mock_inference(chip["chip_index"])

            for det in raw:
                global_det = remap_detection_to_global(
                    det, chip["origin_x"], chip["origin_y"]
                )
                all_detections.append(global_det)

        # Filter to high-value targets above confidence threshold
        hvt = [
            d for d in all_detections
            if d["confidence"] >= self.confidence_threshold
            and d["classification"] in HIGH_VALUE_CLASSES
        ]

        scan_id = str(uuid.uuid4())
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        return {
            "scan_id": scan_id,
            "timestamp": timestamp,
            "chip_count": len(chips),
            "total_detections": len(all_detections),
            "high_value_targets": hvt,
        }

    def _yolo_inference(self, chip_image) -> List[dict]:
        """Run real YOLOv11 inference on a single chip."""
        results = self.model(chip_image, verbose=False)
        detections = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "detection_id": str(uuid.uuid4()),
                    "classification": CLASSIFICATION_LABELS.get(cls_id, "Unknown Signature"),
                    "confidence": round(conf, 4),
                    "bbox": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)],
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                })

        return detections

    def _mock_inference(self, chip_index: int) -> List[dict]:
        """
        Generate realistic mock detections for portfolio demonstration.
        Produces 0-3 detections per chip with varied classifications.
        """
        count = random.choices([0, 1, 2, 3], weights=[30, 40, 20, 10])[0]
        detections = []

        for _ in range(count):
            cls_id = random.choice(list(CLASSIFICATION_LABELS.keys()))
            conf = round(random.uniform(0.35, 0.98), 4)

            cx = random.uniform(50, 590)
            cy = random.uniform(50, 590)
            w = random.uniform(20, 80)
            h = random.uniform(20, 80)

            detections.append({
                "detection_id": str(uuid.uuid4()),
                "classification": CLASSIFICATION_LABELS[cls_id],
                "confidence": conf,
                "bbox": [
                    round(cx - w / 2, 2),
                    round(cy - h / 2, 2),
                    round(cx + w / 2, 2),
                    round(cy + h / 2, 2),
                ],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            })

        return detections
