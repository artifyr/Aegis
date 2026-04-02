"""
Mock Sentinel Hub API Adapter
Simulates fetching satellite imagery for a given AOI and date range.
In production, this would be replaced by the real Sentinel Hub API client.
For the portfolio, it generates synthetic imagery metadata and returns
a placeholder image for inference.
"""

import datetime
import uuid
import random
from typing import Optional
from PIL import Image
import numpy as np
import io


# Simulated satellite catalog
SATELLITE_CATALOG = [
    {"satellite": "SENTINEL-2A", "band": "B04-B03-B02", "resolution_m": 10},
    {"satellite": "SENTINEL-2B", "band": "B04-B03-B02", "resolution_m": 10},
    {"satellite": "SENTINEL-1A", "band": "SAR-VV", "resolution_m": 5},
    {"satellite": "LANDSAT-9", "band": "OLI-TIRS", "resolution_m": 30},
]


class SentinelHubAdapter:
    """
    Mock adapter that simulates the Sentinel Hub Process API.
    Acts as the imagery source for the "Scrub Timeline" interaction.
    """

    def __init__(self):
        self._cache: dict = {}

    def fetch_imagery(
        self,
        aoi_lat: float,
        aoi_lng: float,
        date_str: str,
        width: int = 1280,
        height: int = 1280,
    ) -> dict:
        """
        Simulate fetching satellite imagery for a given Area of Interest.

        Args:
            aoi_lat: Center latitude of the AOI (6-decimal precision).
            aoi_lng: Center longitude of the AOI (6-decimal precision).
            date_str: ISO-8601 date string for the temporal query.
            width: Pixel width of the requested image.
            height: Pixel height of the requested image.

        Returns:
            A dict containing:
              - "acquisition_id": str (UUID)
              - "satellite": str
              - "band": str
              - "resolution_m": int
              - "aoi": dict with lat/lng
              - "acquisition_date": str (ISO-8601)
              - "cloud_cover_pct": float
              - "image_bytes": bytes (synthetic PNG)
              - "width": int
              - "height": int
        """
        cache_key = f"{aoi_lat:.6f}_{aoi_lng:.6f}_{date_str}"

        if cache_key in self._cache:
            return self._cache[cache_key]

        sat = random.choice(SATELLITE_CATALOG)
        cloud_cover = round(random.uniform(0, 35), 1)

        # Generate a synthetic satellite-like dark image with noise
        img_array = self._generate_synthetic_imagery(width, height)
        img = Image.fromarray(img_array)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_bytes = buf.getvalue()

        result = {
            "acquisition_id": str(uuid.uuid4()),
            "satellite": sat["satellite"],
            "band": sat["band"],
            "resolution_m": sat["resolution_m"],
            "aoi": {
                "lat": round(aoi_lat, 6),
                "lng": round(aoi_lng, 6),
            },
            "acquisition_date": date_str,
            "cloud_cover_pct": cloud_cover,
            "image_bytes": image_bytes,
            "width": width,
            "height": height,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }

        self._cache[cache_key] = result
        return result

    def _generate_synthetic_imagery(self, w: int, h: int) -> np.ndarray:
        """
        Generate a synthetic dark satellite image with
        realistic noise patterns and a few bright "structures."
        """
        # Dark base (simulating ocean/land at night or SAR)
        base = np.random.randint(10, 35, (h, w, 3), dtype=np.uint8)

        # Add some bright rectangular "structures" (buildings/ships)
        num_structures = random.randint(3, 12)
        for _ in range(num_structures):
            sx = random.randint(0, w - 40)
            sy = random.randint(0, h - 40)
            sw = random.randint(8, 40)
            sh = random.randint(8, 40)
            brightness = random.randint(120, 240)
            base[sy:sy+sh, sx:sx+sw] = brightness

        # Add scan-line noise (simulating sensor artifacts)
        for _ in range(random.randint(1, 5)):
            line_y = random.randint(0, h - 1)
            base[line_y, :] = np.clip(
                base[line_y, :].astype(int) + random.randint(15, 40), 0, 255
            ).astype(np.uint8)

        return base

    def get_timeline_acquisitions(
        self,
        aoi_lat: float,
        aoi_lng: float,
        start_date: str,
        end_date: str,
    ) -> list:
        """
        Return a list of available acquisition dates for the timeline scrubber.
        Simulates the Sentinel Hub catalog search.
        """
        from datetime import timedelta

        start = datetime.datetime.fromisoformat(start_date)
        end = datetime.datetime.fromisoformat(end_date)
        delta = (end - start).days

        # Sentinel-2 revisit time is ~5 days
        acquisitions = []
        current = start
        while current <= end:
            sat = random.choice(SATELLITE_CATALOG)
            acquisitions.append({
                "date": current.isoformat()[:10],
                "satellite": sat["satellite"],
                "cloud_cover_pct": round(random.uniform(0, 50), 1),
                "available": random.random() > 0.15,  # 85% availability
            })
            current += timedelta(days=random.randint(3, 7))

        return acquisitions
