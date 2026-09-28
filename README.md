<p align="center">
  <img src="public/aegislogo.png" alt="Aegis Tactical Intel" width="180" height="auto" />
</p>

<h1 align="center">AEGIS // TACTICAL WAR ROOM</h1>

<p align="center">
  <strong>Global Geospatial Intelligence (GEOINT) & Multi-Domain Surveillance Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CLASSIFICATION-RESTRICTED-red?style=for-the-badge&logo=shield" alt="Classification" />
  <img src="https://img.shields.io/badge/SURVEILLANCE-ACTIVE-00FF66?style=for-the-badge&logo=radar" alt="Status" />
  <img src="https://img.shields.io/badge/FRAMEWORK-NEXT.JS%2016-black?style=for-the-badge&logo=next.js" alt="Framework" />
  <img src="https://img.shields.io/badge/ENGINE-TURBOPACK-0070F3?style=for-the-badge" alt="Engine" />
</p>

---

## Overview

**AEGIS** is a real-time, military-grade geospatial intelligence and situational awareness system designed for command staff, intelligence analysts, and strategic war rooms. 

The platform aggregates live telemetry across land, sea, airspace, and orbital domains into a unified, high-performance tactical 3D globe and interactive map interface. Powered by WebGL rendering, distributed data pipelines, and contextual AI inference, AEGIS delivers low-latency threat detection and strategic intelligence monitoring across global conflict theaters and critical infrastructure.

---

## Core Capabilities

### Multi-Domain Surveillance and Live Tracking
- **Tactical Airspace (Aviation)**: Real-time global flight tracking categorized by commercial flights, private charters, corporate jets, and military tactical assets with altitude, heading, velocity telemetry, and GPS jamming correlation.
- **Maritime Operations and Chokepoints**: Live AIS vessel tracking via distributed WebSocket streams with classification for cargo carriers, oil/LNG tankers, and naval military vessels, alongside monitoring of strategic maritime straits and deep-sea fiber optic communication cables.
- **Orbital Constellations (Satellites)**: Live orbital propagation and ephemeris tracking across defense, reconnaissance, communications, and weather constellations calculated from active SatNOGS TLE feeds.
- **Worldwide CCTV Grid**: In-browser low-latency RTSP and HLS proxying of worldwide public surveillance cameras, traffic cams, and regional feeds across Europe, North America, and Asia.

### Tactical Hazards, Threats and Critical Infrastructure
- **Active Fires and Wildfire Detection**: Near real-time thermal anomaly and wildfire detection sourced from NASA FIRMS Open Data (Suomi-NPP VIIRS / MODIS) with fire radiative power and brightness indexes.
- **Seismic Activity and Earthquakes**: Real-time tectonic event ingestion with magnitude filtering, epicenter depths, and automated impact radius calculation.
- **Extreme Weather Anomalies**: Real-time atmospheric hazards tracking, tropical cyclones, storm fronts, and high-impact meteorological events.
- **Strategic Facilities and Nuclear Infrastructure**: Mapping and operational status tracking of civilian nuclear reactors, enrichment facilities, naval bases, radar stations, and military command hubs.
- **GPS Jamming and Electronic Warfare**: Visualized RF interference hotspots and spoofing zones affecting regional navigation corridors.

### Contextual Intelligence and Analysis
- **OSINT News Aggregation**: Automated ingestion and correlation of real-time open-source intelligence feeds and conflict monitoring channels with automated geocoding and threat level scoring.
- **Region Dossier Intelligence**: Instant coordinate inspection delivering regional risk assessments, nearby strategic assets, airfields, active emergency notices, and Sentinel-1 SAR synthetic aperture radar overpasses.
- **Analytics and Mission Archive**: Persistent logging of tactical records, historical incidents, and cross-theater statistical analytics.

---

## Security and Architecture Highlights

- **Role-Based Tactical Authentication**: Multi-tier access control with authenticated operational clearance and restricted guest exploration modes.
- **Zero-Trust Reverse Proxying**: Next.js 16 server-side proxy architecture protecting data endpoints, sanitizing external payloads, and securing API keys.
- **High-Performance WebGL Mapbox Core**: Hardware-accelerated vector rendering engineered to visualize tens of thousands of dynamic points, flight vectors, and shipping lanes at 60 FPS.
- **Resilient Fallback Pipelines**: Multi-source fallback mechanisms across all telemetry layers guaranteeing continuous operational readiness even under upstream API outages.
