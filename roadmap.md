# Aegis / Geosint Future Roadmap

This roadmap outlines the path to upgrading the Aegis Tactical Dashboard to reach full feature parity with large-scale, production-grade intelligence platforms (a Palantir alternative).

## 1. Map & Visualization Engine Upgrades
- [ ] **Migrate to MapLibre GL**: Transition from Mapbox GL to MapLibre GL to enable true open-source scaling and high-performance WebGL rendering capable of handling thousands of concurrent entities at 60fps without proprietary API token restrictions.
- [ ] **Data Layer Unification**: Create a unified layer management system with at least 16 toggleable data layers (like a holographic deck) to toggle between multiple data streams instantly.

## 2. Real-Time Global Data Streams & Layers
*The sidebar will be broken down into granular toggleable layers.*

**Aviation (Live Flight Tracking)**
- [ ] Implement OpenSky Network to render active flights.
- [ ] Sub-filters: Commercial, Private, Private Jets, Military.

**Maritime & Space**
- [ ] **Maritime / Naval**: Track major global ports and chokepoints using Static Naval Intel.
- [ ] **Space (Satellites & Solar Weather)**: Track satellite positions.

**Surveillance & Hazards**
- [x] **CCTV / Surveillance Integration**: Dynamic overpass querying and global webcams integration. (COMPLETED)
- [ ] **24/7 Global News Feeds**: Implement live streams and feeds pulling from global broadcasters.
- [ ] **Earthquake & Seismic Monitoring (Seismic)**: USGS Earthquake API for real-time M2.5+ events.
- [ ] **Active Fires & Hotspots (Fires)**: NASA FIRMS for active hotspots.
- [ ] **Severe Events Monitoring (Weather)**: NASA EONET for severe weather and environmental hazards.

**Threats, Sanctions & Infrastructure**
- [ ] **Nuclear Facilities**: Static intel mapping of global nuclear sites.
- [ ] **Global Incidents**: Track severity-coded warning markers across conflict zones.
- [ ] **GPS Jamming**: Visualize global GPS interference and spoofing zones.
- [ ] **SDN Sanctions Search (Sanctions)**: Search tool for Person/Organization/Vessel utilizing OpenSanctions (US OFAC SDN mirror).

**Display Options**
- [ ] **Day / Night Cycle**: A global shadow overlay showing real-time solar terminator.

## 3. Command & Intelligence Modules

**SCM Risk Command (Supply Chain Management)**
- [ ] **Market Impact Alerts**: Correlate geopolitical events with market risks (e.g., "High risk of WTI/Brent Crude spike due to Hormuz congestion").
- [ ] **Congested Nodes**: Monitor shipping volume/delays at critical chokepoints (Strait of Hormuz, Bab el-Mandeb).
- [ ] **Critical Suppliers**: Uptime tracking for Tier 1/2 monitored nodes.

**Markets & Intel Dashboard**
- [ ] **Space Weather & Satellite Tracker (Space)**: Display Kp Index, solar flares (NOAA SWPC), and satellite coordinates (N2YO).
- [ ] **Live Financial Tickers**: Real-time stock feeds categorized by:
  - *Indices* (Global market health)
  - *Defense* (RTX, LMT, NOC, GD, BA, PLTR)
  - *Energy* (Crude, Natural Gas, etc.)

**Region Presets & Navigation**
- [x] **Globe Reset & Precision Navigation**: Cyan globe reset widget and precise zoom-to-cursor/coordinate tracking. (COMPLETED)
- [ ] Implement quick-jump buttons for global regions (Global, Europe, Middle East, Americas, Ukraine, Africa, S.E. Asia, Arctic, India, Australia, Sudan).
- [ ] Add real-time "hot zone" indicators (red pulsing dots) next to active conflict regions.

## 4. Reconnaissance Toolkit (Side-Panel Modules)

**Network Intelligence (Cyber Domain 17-Tool Suite)**
- [ ] Fully implement the 17-tool Recon Toolkit including: Global IP Sweep, Port Scan, Vuln Scan, DNS, WHOIS, CERTS, Threats, Headers, SSL/TLS, Subdomain Enum, Tech Detect, Shodan, BGP Map, MAC Lookup, Ping Sweep, and Data Leaks.
- [ ] **CVE Threats & Vuln Scan (Cyber)**: Search CVE vulnerabilities via the NVD database, and run automated local scanning diagnostics.
- [ ] **Live Alerts Panel**
  - Implement a tabbed alert feed (All, News, Quakes, Feeds).
  - **Telegram OSINT**: Embed geoparsed posts from public military/intel channels via direct `t.me/s/<channel>` web previews.

## 5. Architectural & Backend Expansions
- [x] **Vercel Cost & Deployment Optimization**: Deployed to `aegisint` using lightweight configuration and disabled ISR for heavy dynamic routes. (COMPLETED)
- [ ] **Persistent Database**: Migrate in-memory seeds and configurations to a proper PostgreSQL/PostGIS database for handling spatial queries and saving targets persistently.
- [ ] **Dockerization**: Create a `docker-compose.yml` that cleanly orchestrates the Next.js frontend, FastAPI backend, and PostgreSQL database for one-click self-hosting.
- [ ] **AI Neural Observer Pipeline**: Expand the backend with YOLO/OpenCV to run automated object detection on active video streams and send structural alerts when threats are identified.

