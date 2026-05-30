from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/api/v1/maritime", tags=["Maritime"])

# Static Naval Intel - OSIRIS Style
# 39 Global Ports and 10 Chokepoints
GLOBAL_PORTS = [
    {"id": "p1", "name": "Port of Shanghai", "country": "China", "lat": 31.2222, "lon": 121.4581, "type": "Port", "volume": "High"},
    {"id": "p2", "name": "Port of Singapore", "country": "Singapore", "lat": 1.264, "lon": 103.84, "type": "Port", "volume": "High"},
    {"id": "p3", "name": "Port of Ningbo-Zhoushan", "country": "China", "lat": 29.8739, "lon": 121.544, "type": "Port", "volume": "High"},
    {"id": "p4", "name": "Port of Shenzhen", "country": "China", "lat": 22.5431, "lon": 114.0579, "type": "Port", "volume": "High"},
    {"id": "p5", "name": "Port of Guangzhou", "country": "China", "lat": 23.1291, "lon": 113.2644, "type": "Port", "volume": "High"},
    {"id": "p6", "name": "Port of Busan", "country": "South Korea", "lat": 35.1017, "lon": 129.0300, "type": "Port", "volume": "High"},
    {"id": "p7", "name": "Port of Qingdao", "country": "China", "lat": 36.0671, "lon": 120.3826, "type": "Port", "volume": "High"},
    {"id": "p8", "name": "Port of Hong Kong", "country": "Hong Kong", "lat": 22.3372, "lon": 114.1287, "type": "Port", "volume": "High"},
    {"id": "p9", "name": "Port of Tianjin", "country": "China", "lat": 38.9833, "lon": 117.7333, "type": "Port", "volume": "High"},
    {"id": "p10", "name": "Port of Rotterdam", "country": "Netherlands", "lat": 51.885, "lon": 4.2867, "type": "Port", "volume": "High"},
    {"id": "p11", "name": "Port of Jebel Ali", "country": "UAE", "lat": 24.9857, "lon": 55.0273, "type": "Port", "volume": "High"},
    {"id": "p12", "name": "Port Kelang", "country": "Malaysia", "lat": 3.0, "lon": 101.4, "type": "Port", "volume": "Medium"},
    {"id": "p13", "name": "Port of Xiamen", "country": "China", "lat": 24.4798, "lon": 118.0894, "type": "Port", "volume": "Medium"},
    {"id": "p14", "name": "Port of Antwerp", "country": "Belgium", "lat": 51.2746, "lon": 4.3168, "type": "Port", "volume": "Medium"},
    {"id": "p15", "name": "Port of Kaohsiung", "country": "Taiwan", "lat": 22.5802, "lon": 120.3015, "type": "Port", "volume": "Medium"},
    {"id": "p16", "name": "Port of Dalian", "country": "China", "lat": 38.9304, "lon": 121.6543, "type": "Port", "volume": "Medium"},
    {"id": "p17", "name": "Port of Los Angeles", "country": "USA", "lat": 33.7292, "lon": -118.2620, "type": "Port", "volume": "Medium"},
    {"id": "p18", "name": "Port of Hamburg", "country": "Germany", "lat": 53.5434, "lon": 9.9402, "type": "Port", "volume": "Medium"},
    {"id": "p19", "name": "Port of Tanjung Pelepas", "country": "Malaysia", "lat": 1.3638, "lon": 103.5469, "type": "Port", "volume": "Medium"},
    {"id": "p20", "name": "Port of Long Beach", "country": "USA", "lat": 33.7542, "lon": -118.2166, "type": "Port", "volume": "Medium"},
    {"id": "p21", "name": "Port of Laem Chabang", "country": "Thailand", "lat": 13.0827, "lon": 100.8765, "type": "Port", "volume": "Medium"},
    {"id": "p22", "name": "Port of Yingkou", "country": "China", "lat": 40.2667, "lon": 122.2333, "type": "Port", "volume": "Medium"},
    {"id": "p23", "name": "Port of Ho Chi Minh City", "country": "Vietnam", "lat": 10.7769, "lon": 106.7009, "type": "Port", "volume": "Medium"},
    {"id": "p24", "name": "Port of Bremen/Bremerhaven", "country": "Germany", "lat": 53.5511, "lon": 8.5744, "type": "Port", "volume": "Medium"},
    {"id": "p25", "name": "Port of Taicang", "country": "China", "lat": 31.45, "lon": 121.1333, "type": "Port", "volume": "Medium"},
    {"id": "p26", "name": "Port of Colombo", "country": "Sri Lanka", "lat": 6.9429, "lon": 79.8465, "type": "Port", "volume": "Medium"},
    {"id": "p27", "name": "Port of Jawaharlal Nehru", "country": "India", "lat": 18.949, "lon": 72.9515, "type": "Port", "volume": "Medium"},
    {"id": "p28", "name": "Port of Lianyungang", "country": "China", "lat": 34.75, "lon": 119.3333, "type": "Port", "volume": "Medium"},
    {"id": "p29", "name": "Port of Tokyo", "country": "Japan", "lat": 35.6186, "lon": 139.7744, "type": "Port", "volume": "Medium"},
    {"id": "p30", "name": "Port of Mundra", "country": "India", "lat": 22.7384, "lon": 69.7029, "type": "Port", "volume": "Medium"},
    {"id": "p31", "name": "Port of Savannah", "country": "USA", "lat": 32.1221, "lon": -81.1444, "type": "Port", "volume": "Medium"},
    {"id": "p32", "name": "Port of Rizhao", "country": "China", "lat": 35.3857, "lon": 119.5393, "type": "Port", "volume": "Medium"},
    {"id": "p33", "name": "Port of Fuzhou", "country": "China", "lat": 26.0745, "lon": 119.2965, "type": "Port", "volume": "Medium"},
    {"id": "p34", "name": "Port of Dongguan", "country": "China", "lat": 22.8466, "lon": 113.6276, "type": "Port", "volume": "Medium"},
    {"id": "p35", "name": "Port of Piraeus", "country": "Greece", "lat": 37.9443, "lon": 23.6457, "type": "Port", "volume": "Medium"},
    {"id": "p36", "name": "Port of Algeciras", "country": "Spain", "lat": 36.136, "lon": -5.4382, "type": "Port", "volume": "Medium"},
    {"id": "p37", "name": "Port of Valencia", "country": "Spain", "lat": 39.4449, "lon": -0.3228, "type": "Port", "volume": "Medium"},
    {"id": "p38", "name": "Port of Yokohama", "country": "Japan", "lat": 35.4437, "lon": 139.638, "type": "Port", "volume": "Medium"},
    {"id": "p39", "name": "Port of New York/New Jersey", "country": "USA", "lat": 40.6722, "lon": -74.0205, "type": "Port", "volume": "High"}
]

CHOKEPOINTS = [
    {"id": "c1", "name": "Strait of Hormuz", "lat": 26.5667, "lon": 56.25, "type": "Chokepoint", "risk": "High"},
    {"id": "c2", "name": "Strait of Malacca", "lat": 4.0, "lon": 100.0, "type": "Chokepoint", "risk": "High"},
    {"id": "c3", "name": "Suez Canal", "lat": 30.5852, "lon": 32.2654, "type": "Chokepoint", "risk": "High"},
    {"id": "c4", "name": "Bab el-Mandeb", "lat": 12.5833, "lon": 43.3333, "type": "Chokepoint", "risk": "Critical"},
    {"id": "c5", "name": "Bosporus Strait", "lat": 41.221, "lon": 29.1232, "type": "Chokepoint", "risk": "Medium"},
    {"id": "c6", "name": "Panama Canal", "lat": 9.08, "lon": -79.68, "type": "Chokepoint", "risk": "Medium"},
    {"id": "c7", "name": "Danish Straits", "lat": 56.0, "lon": 11.0, "type": "Chokepoint", "risk": "Low"},
    {"id": "c8", "name": "Cape of Good Hope", "lat": -34.3581, "lon": 18.4719, "type": "Chokepoint", "risk": "Low"},
    {"id": "c9", "name": "Taiwan Strait", "lat": 24.8, "lon": 119.9, "type": "Chokepoint", "risk": "High"},
    {"id": "c10", "name": "English Channel", "lat": 50.1833, "lon": -0.5333, "type": "Chokepoint", "risk": "Low"}
]

@router.get("/")
async def get_maritime_data():
    """
    Returns static naval intel mapping 39 global ports and 10 critical chokepoints.
    """
    return {
        "ports": GLOBAL_PORTS,
        "chokepoints": CHOKEPOINTS,
        "total_ports": len(GLOBAL_PORTS),
        "total_chokepoints": len(CHOKEPOINTS)
    }
