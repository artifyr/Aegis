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

  // Maritime
  useEffect(() => {
    const fetchMaritime = () => {
      fetch('/api/maritime')
        .then(res => res.json())
        .then(data => {
          setPorts(data.ports || []);
          setChokepoints(data.chokepoints || []);
          setShips(data.ships || []);
        })
        .catch(err => console.error("Maritime fetch failed", err));
    };
    fetchMaritime();
    const intervalId = setInterval(fetchMaritime, 60000);
    return () => clearInterval(intervalId);
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

  return null;
}
