"""
Tactical Image Chipping Module
Partitions a high-resolution GeoTIFF or PNG into smaller tactical "chips"
for efficient batch inference with the YOLO Neural Observer.
"""

from PIL import Image
import io
import math
from typing import List, Tuple


def partition_image(
    image_bytes: bytes,
    chip_size: int = 640,
    overlap: int = 64,
) -> List[dict]:
    """
    Partition a large satellite/aerial image into overlapping chips.

    Args:
        image_bytes: Raw bytes of the input image (PNG or TIFF).
        chip_size: Width/height of each chip in pixels (YOLO default: 640).
        overlap: Pixel overlap between adjacent chips to avoid edge-clipping detections.

    Returns:
        A list of dicts, each containing:
          - "chip_index": int
          - "image": PIL.Image chip
          - "origin_x": int (top-left x in the original image)
          - "origin_y": int (top-left y in the original image)
          - "width": int
          - "height": int
    """
    img = Image.open(io.BytesIO(image_bytes))
    img_w, img_h = img.size
    stride = chip_size - overlap

    cols = max(1, math.ceil((img_w - overlap) / stride))
    rows = max(1, math.ceil((img_h - overlap) / stride))

    chips: List[dict] = []
    idx = 0

    for row in range(rows):
        for col in range(cols):
            x0 = col * stride
            y0 = row * stride
            x1 = min(x0 + chip_size, img_w)
            y1 = min(y0 + chip_size, img_h)

            chip = img.crop((x0, y0, x1, y1))

            # Pad to chip_size if the chip is smaller at the edges
            if chip.size != (chip_size, chip_size):
                padded = Image.new(img.mode, (chip_size, chip_size), 0)
                padded.paste(chip, (0, 0))
                chip = padded

            chips.append({
                "chip_index": idx,
                "image": chip,
                "origin_x": x0,
                "origin_y": y0,
                "width": x1 - x0,
                "height": y1 - y0,
            })
            idx += 1

    return chips


def remap_detection_to_global(
    detection: dict,
    chip_origin_x: int,
    chip_origin_y: int,
) -> dict:
    """
    Remap a detection's bounding box coordinates from chip-local
    space back to the original full-resolution image space.
    """
    det = detection.copy()
    det["bbox"] = [
        det["bbox"][0] + chip_origin_x,
        det["bbox"][1] + chip_origin_y,
        det["bbox"][2] + chip_origin_x,
        det["bbox"][3] + chip_origin_y,
    ]
    return det
