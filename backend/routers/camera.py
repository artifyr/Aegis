from fastapi import APIRouter, Query, HTTPException
import httpx
import os
from dotenv import load_dotenv

# Automatically load the Next.js .env.local from the workspace root (two dirs up)
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env.local"))

router = APIRouter(prefix="/api/v1/camera", tags=["camera"])

# Windy Webcams API v3 Key from env
WINDY_API_KEY = os.getenv("WINDY_API_KEY", "")

@router.get("/{camera_id}/stream")
async def get_camera_stream(camera_id: str, lat: float = Query(...), lng: float = Query(...)):
    """
    Given a camera node ID and its lat/lng, attempt to find a nearby webcam
    via the Windy Webcams API v3 (free for developers). 
    If no key or no stream is found, fallback to simulated.
    """
    if WINDY_API_KEY:
        # Official Windy Webcams API v3 Endpoint
        # Using a 5km radius to guarantee a hit if one is around
        url = "https://api.windy.com/webcams/api/v3/webcams"
        headers = {
            "x-windy-api-key": WINDY_API_KEY
        }
        async with httpx.AsyncClient() as client:
            try:
                # include images and player in the response, filtering by nearby coordinates
                params = {
                    "nearby": f"{lat},{lng},5",
                    "include": "images,player",
                    "limit": 1
                }
                res = await client.get(url, headers=headers, params=params, timeout=10.0)
                
                if res.status_code == 200:
                    data = res.json()
                    webcams = data.get("webcams", [])
                    if webcams:
                        webcam = webcams[0]
                        
                        # Extract the player embed link (requires include=player)
                        player_embed = None
                        if webcam.get("player") and webcam["player"].get("day"):
                            player_embed = webcam["player"]["day"]
                        if webcam.get("player") and webcam["player"].get("live"):
                            player_embed = webcam["player"]["live"]

                        # Extract the latest image preview (requires include=images)
                        image_url = None
                        if webcam.get("images") and webcam["images"].get("current"):
                            image_url = webcam["images"]["current"].get("preview")

                        if player_embed:
                            return {
                                "status": "LIVE UPLINK ESTABLISHED",
                                "stream_url": player_embed,
                                "image_url": image_url,
                                "uptime": "99.9%"
                            }
            except Exception as e:
                print(f"Windy fetch failed: {e}")

    # Fallback to a mock loop if no valid stream/API key 
    # to maintain the Tactical Glass design system.
    return {
        "status": "LIVE UPLINK ESTABLISHED (SIMULATED)",
        "stream_url": "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ",
        "image_url": "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=500&q=60",
        "uptime": "99.9%"
    }
