from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter(prefix="/api/v1/aviation", tags=["Aviation"])

OPENSKY_URL = "https://opensky-network.org/api/states/all"

@router.get("/")
async def get_live_flights(
    lamin: float = Query(None, description="South latitude"),
    lomin: float = Query(None, description="West longitude"),
    lamax: float = Query(None, description="North latitude"),
    lomax: float = Query(None, description="East longitude"),
):
    """
    Fetches real-time flight data from OpenSky Network.
    Can be filtered by bounding box to prevent massive payloads and rate limits.
    """
    params = {}
    if lamin is not None and lomin is not None and lamax is not None and lomax is not None:
        params = {
            "lamin": lamin,
            "lomin": lomin,
            "lamax": lamax,
            "lomax": lomax,
        }
    
    async with httpx.AsyncClient() as client:
        try:
            # We add a generous timeout as OpenSky can be slow
            response = await client.get(OPENSKY_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Format the output to be consumed by the frontend easily
            flights = []
            if data.get("states"):
                for state in data["states"]:
                    # OpenSky states array indices:
                    # 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 
                    # 4: last_contact, 5: longitude, 6: latitude, 7: baro_altitude, 
                    # 8: on_ground, 9: velocity, 10: true_track, 11: vertical_rate
                    if state[5] is not None and state[6] is not None:  # Must have valid coords
                        flights.append({
                            "icao24": state[0],
                            "callsign": state[1].strip() if state[1] else "UNKNOWN",
                            "origin_country": state[2],
                            "longitude": state[5],
                            "latitude": state[6],
                            "altitude": state[7] or 0,
                            "velocity": state[9] or 0,
                            "true_track": state[10] or 0,
                            "on_ground": state[8]
                        })
            
            return {"count": len(flights), "flights": flights}
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise HTTPException(status_code=429, detail="OpenSky Network rate limit exceeded.")
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching from OpenSky API")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
