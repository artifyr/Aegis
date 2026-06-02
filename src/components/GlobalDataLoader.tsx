'use client';

import { useEffect } from 'react';
import { useTacticalStore } from '@/store/tactical-store';

export function GlobalDataLoader() {
  const setPorts = useTacticalStore(state => state.setPorts);
  const setChokepoints = useTacticalStore(state => state.setChokepoints);
  const setShips = useTacticalStore(state => state.setShips);
  const setFlights = useTacticalStore(state => state.setFlights);
  const setSatellites = useTacticalStore(state => state.setSatellites);
  const setEarthquakes = useTacticalStore(state => state.setEarthquakes);
  const setNuclearFacilities = useTacticalStore(state => state.setNuclearFacilities);
  const setStrategicBases = useTacticalStore(state => state.setStrategicBases);
  const setIncidents = useTacticalStore(state => state.setIncidents);
  const setNews = useTacticalStore(state => state.setNews);
  const setWeatherEvents = useTacticalStore(state => state.setWeatherEvents);

  // News
  useEffect(() => {
    const fetchNews = () => {
      fetch('/api/news')
        .then(res => res.json())
        .then(data => {
          if (data.news) setNews(data.news);
        })
        .catch(err => console.error("News fetch failed", err));
    };
    fetchNews();
    const intervalId = setInterval(fetchNews, 60000);
    return () => clearInterval(intervalId);
  }, [setNews]);

  // Maritime
  useEffect(() => {
    const shipsMap = new Map();
    let ws: WebSocket | null = null;
    let wsConnecting = false;

    // 1. Fetch static ports, chokepoints, and ghost ships from backend
    const fetchMaritime = () => {
      fetch('/api/maritime')
        .then(res => res.json())
        .then(data => {
          setPorts(data.ports || []);
          setChokepoints(data.chokepoints || []);
          
          // Seed local cache with ghost ships and stale backend ships
          (data.ships || []).forEach((s: any) => {
            if (!shipsMap.has(s.mmsi)) {
              shipsMap.set(s.mmsi, s);
            }
          });
          
          // Flush the combined local cache to the global store every 90s
          setShips(Array.from(shipsMap.values()));
        })
        .catch(err => console.error("Maritime fetch failed", err));
    };
    
    fetchMaritime();
    const intervalId = setInterval(fetchMaritime, 90000);

    // 2. Client-side live AIS stream (bypasses Vercel serverless freeze)
    const connectWS = () => {
      const apiKey = process.env.NEXT_PUBLIC_AIS_API_KEY;
      if (!apiKey || wsConnecting) return;
      wsConnecting = true;

      try {
        ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
      } catch (e) {
        wsConnecting = false;
        return;
      }

      ws.onopen = () => {
        wsConnecting = false;
        const subscriptionMessage = {
          APIKey: apiKey,
          BoundingBoxes: [
            [[34.8, 139.5], [35.7, 140.2]],
            [[25.0, 54.0], [27.5, 57.5]],
            [[27.0, 32.0], [32.0, 33.5]],
            [[12.0, 42.5], [14.0, 44.0]],
            [[8.0, -80.5], [10.0, -79.0]],
            [[1.0, 103.0], [3.0, 104.5]],
            [[22.0, 118.0], [26.0, 121.0]],
            [[50.0, 0.0], [53.0, 5.0]],
            [[33.0, -119.0], [34.5, -117.0]],
            [[-90, -180], [90, 180]]
          ],
          FilterMessageTypes: ["PositionReport", "ShipStaticData"]
        };
        ws?.send(JSON.stringify(subscriptionMessage));
      };

      const getAegisShipType = (typeCode: number) => {
        if (!typeCode) return 'cargo';
        if (typeCode >= 80 && typeCode <= 89) return 'tanker';
        if (typeCode >= 70 && typeCode <= 79) return 'cargo';
        if (typeCode === 35) return 'military';
        return 'cargo';
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const mmsi = parsed.MetaData?.MMSI;
          if (!mmsi) return;

          const existing = shipsMap.get(mmsi) || { id: mmsi, mmsi, timestamp: Date.now() };

          if (parsed.MetaData?.ShipName) {
            existing.name = parsed.MetaData.ShipName.trim();
          }

          if (parsed.MessageType === "PositionReport" && parsed.Message?.PositionReport) {
            const report = parsed.Message.PositionReport;
            existing.lat = report.Latitude;
            existing.lng = report.Longitude;
            existing.speed = report.Sog;
            existing.heading = report.TrueHeading || report.Cog;
            existing.timestamp = Date.now();
          } else if (parsed.MessageType === "ShipStaticData" && parsed.Message?.ShipStaticData) {
            const staticData = parsed.Message.ShipStaticData;
            existing.name = staticData.Name ? staticData.Name.trim() : existing.name;
            existing.destination = staticData.Destination ? staticData.Destination.trim() : existing.destination;
            existing.type = getAegisShipType(staticData.Type);
          }

          if (existing.lat && existing.lng) {
            shipsMap.set(mmsi, existing);
          }
          if (shipsMap.size > 20000) {
            const firstKey = shipsMap.keys().next().value;
            if (firstKey) shipsMap.delete(firstKey);
          }
        } catch (e) {
           // ignore parse errors
        }
      };

      ws.onclose = () => {
        wsConnecting = false;
        setTimeout(connectWS, 5000);
      };
      
      ws.onerror = () => {
        ws?.close();
      };
    };
    
    // Slight delay so the initial backend fetch populates first
    setTimeout(connectWS, 2000);

    return () => {
      clearInterval(intervalId);
      if (ws) {
        ws.onclose = null; // Prevent auto-reconnect on unmount
        ws.close();
      }
    };
  }, [setPorts, setChokepoints, setShips]);

  // Aviation
  useEffect(() => {
    const fetchAviation = () => {
      fetch('/api/aviation')
        .then(res => res.json())
        .then(data => {
          const allFlights = [
            ...(data.commercial_flights || []),
            ...(data.private_flights || []),
            ...(data.private_jets || []),
            ...(data.military_flights || [])
          ];
          setFlights(allFlights);
        })
        .catch(err => console.error("Aviation fetch failed", err));
    };
    fetchAviation();
    const intervalId = setInterval(fetchAviation, 90000);
    return () => clearInterval(intervalId);
  }, [setFlights]);

  // Satellites
  useEffect(() => {
    const fetchSatellites = () => {
      fetch('/api/satellites')
        .then(res => res.json())
        .then(data => {
          if (data.satellites) setSatellites(data.satellites);
        })
        .catch(err => console.error("Satellites fetch failed", err));
    };
    fetchSatellites();
    const intervalId = setInterval(fetchSatellites, 60000);
    return () => clearInterval(intervalId);
  }, [setSatellites]);

  // Earthquakes
  useEffect(() => {
    const fetchEarthquakes = () => {
      fetch('/api/earthquakes')
        .then(res => res.json())
        .then(data => {
          if (data.earthquakes) setEarthquakes(data.earthquakes);
        })
        .catch(err => console.error("Earthquakes fetch failed", err));
    };
    fetchEarthquakes();
    const intervalId = setInterval(fetchEarthquakes, 300000);
    return () => clearInterval(intervalId);
  }, [setEarthquakes]);

  // Nuclear
  useEffect(() => {
    const fetchNuclear = () => {
      fetch('/api/infrastructure')
        .then(res => res.json())
        .then(data => {
          if (data.infrastructure) setNuclearFacilities(data.infrastructure);
        })
        .catch(err => console.error("Nuclear fetch failed", err));
    };
    fetchNuclear();
    const intervalId = setInterval(fetchNuclear, 300000);
    return () => clearInterval(intervalId);
  }, [setNuclearFacilities]);

  // Strategic Bases
  useEffect(() => {
    const fetchStrategic = () => {
      fetch('/api/strategic')
        .then(res => res.json())
        .then(data => {
          if (data.bases) setStrategicBases(data.bases);
        })
        .catch(err => console.error("Strategic bases fetch failed", err));
    };
    fetchStrategic();
    const intervalId = setInterval(fetchStrategic, 300000);
    return () => clearInterval(intervalId);
  }, [setStrategicBases]);

  // Incidents
  useEffect(() => {
    const fetchIncidents = () => {
      fetch('/api/incidents')
        .then(res => res.json())
        .then(data => {
          if (data.events) setIncidents(data.events);
        })
        .catch(err => console.error("Incidents fetch failed", err));
    };
    fetchIncidents();
    const intervalId = setInterval(fetchIncidents, 300000);
    return () => clearInterval(intervalId);
  }, [setIncidents]);

  // Severe Weather
  useEffect(() => {
    const fetchWeather = () => {
      fetch('/api/severe-weather')
        .then(res => res.json())
        .then(data => {
          if (data.events) setWeatherEvents(data.events);
        })
        .catch(err => console.error("Severe Weather fetch failed", err));
    };
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 300000);
    return () => clearInterval(intervalId);
  }, [setWeatherEvents]);

  return null;
}
