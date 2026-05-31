# Aegis Tactical Dashboard - Tasklist & Implementation Tracking

This document outlines the development status, recently completed features, new integration requirements, and the upcoming roadmap for the Aegis Tactical Dashboard.

---

## 📋 Recently Completed Features
The following features and optimizations have been successfully implemented:

- [x] **Aegis Command rebranding**: Renamed "Geoint Command" to "Aegis Command" across the dashboard.
- [x] **Initial Layer States**: Configured all layers/filter states to be disabled on initial load by default unless saved layer state exists.
- [x] **Vercel Deployment Setup**: Deployed to Vercel under the name `aegisint` (`aegisint.vercel.app`).
  - [x] Implemented `.vercelignore` to exclude heavy Python backend modules (PyTorch/Ultralytics) to bypass Vercel's 500MB Lambda limit.
  - [x] Injected environment keys (Mapbox token, Windy API keys) into Vercel production.
  - [x] Disabled Next.js ISR for heavy pages to cut down on Vercel compute/caching costs.
  - [x] Cleaned up legacy/unused Stitch configuration and build files.
- [x] **Holographic Map Controls & UI Overlays**:
  - [x] Removed the scrub timeline from the viewport.
  - [x] Added a **Reset Globe** button placed inside the frame (top-right, styled in cyan) that zooms out to view the entire globe.
  - [x] Improved zoom physics: scrolling or zooming now aligns precisely with the mouse cursor position.
  - [x] Integrated real-time cursor tracking at the bottom bar showing live coordinates (Latitude & Longitude) under the user's cursor.
- [x] **Aviation Layer Optimizations**:
  - [x] Reduced flight marker sizing (down to 14x14px SVGs) for visual precision.
  - [x] Pre-filtered aviation markers (military/commercial) before capping DOM elements at 300 to improve render performance to a stable 60fps.
  - [x] Fixed military flight visibility to render correctly when their respective layer is toggled on.
- [x] **Satellite Tracking**:
  - [x] Integrated SatNOGS DB API for fetching TLE data.
  - [x] Added `propagateSGP4Simple` engine for real-time coordinate plotting.
  - [x] Added GeoJSON Source and Circle Layer rendering in TacticalMap.
- [x] **Region Dossier OSINT Tool**:
  - [x] Created a parallel-fetching Next.js API that synthesizes reverse-geocoding, RestCountries API, Wikipedia summaries, and Wikidata SPARQL queries (Head of State).
  - [x] Integrated a contextual right-click modal into the Tactical Map to surface localized intelligence anywhere on the globe.

---

## 🎯 To Be Implemented (New Data Streams)
These real-time domains are scheduled for integration to provide global situation awareness:

| Domain | Data Points | Target Source / API | Status |
| :--- | :--- | :--- | :--- |
| **Seismic** | Real-time M2.5+ earthquake alerts & coordinates | USGS Earthquake API | ⬜ Pending |
| **Fires** | Active wildfires, thermal hotspots, and coordinates | NASA FIRMS | ⬜ Pending |
| **Weather** | Severe weather warnings, cyclones, and atmospheric events | NASA EONET | ⬜ Pending |
| **Space** | Satellite orbits (SatNOGS TLE propagation) & Space weather indicators | SatNOGS API, NOAA SWPC | 🔄 In Progress |
| **Cyber** | Real-time CVE intelligence & custom network vulnerability scans | NVD, Custom Scanner | ⬜ Pending |
| **Sanctions** | SDN (Specially Designated Nationals) name search (Person/Org/Vessel) | OpenSanctions (US OFAC SDN Mirror) | ⬜ Pending |

---

## 🗺️ Extended Future Roadmap Checklist

### 1. Map & Visualization Engine
- [ ] **Migrate to MapLibre GL**: Enable open-source scaling and high-performance WebGL rendering.
- [ ] **Unified Holographic Deck**: Build a layer system handling 16+ concurrent data streams with custom presets.
- [ ] **Solar Terminator Overlay**: Render real-time day/night cycles across the globe.

### 2. Supply Chain & Market Impact Modules
- [ ] **SCM Risk Command**: Correlate geopolitical bottlenecks with market risks (e.g. Hormuz, Bab el-Mandeb).
- [ ] **Monitored Node Health**: Real-time tracking of critical chokepoints and major global logistics hubs.
- [ ] **Live Market Tickers**: Defense tickers (RTX, LMT, NOC, GD, BA, PLTR) and energy indices.

### 3. Tactical toolkit (Recon Pane)
- [ ] **17-Tool Cyber Suite**: Complete implementation of the cyber security intelligence panel.
- [ ] **Telegram OSINT Feed**: Direct geoparsed updates from public military channels.
- [ ] **Real-time Region Jump**: Navigation preset shortcuts for global conflict regions (Ukraine, Middle East, Arctic, India, Sudan, S.E. Asia).

### 4. Persistence & Machine Intelligence
- [ ] **PostgreSQL/PostGIS Migration**: Build a database for geographical coordinate persistence and target locks.
- [ ] **Docker Orchestration**: Complete self-hosting bundle via `docker-compose`.
- [ ] **Automated YOLO Inference**: Expand OpenCV video-stream object tracking in the Neural Observer pipeline.
