# Aegis Tactical Dashboard - Progress Summary

## Overview
Aegis Tactical Dashboard is a high-performance, real-time geospatial intelligence application mimicking a premium, military-grade "tactical glass" command system. It fuses simulated real-time asset telemetry (Naval and Aerial domains) with a backend object detection inference pipeline (Neural Observer). The project is built using **Next.js 16**, **Tailwind CSS**, and **FastAPI**.

## Core Functionalities Implemented

### 1. Global Surveillance Tactical Map (Frontend)
*   **3D Holographic Globe**: Powered by Mapbox GL JS (`react-map-gl`), styled with a dark, low-orbit holographic theme.
*   **Custom HUD Coordinate Overlays**: Standard map markers replaced with dynamic SVG targeting brackets and centered pulse rings that animate upon target lock.
*   **Camera Dive & Ghost Grid**: Clicking an asset initiates a high-velocity, cinematic `flyTo` animation. The view seamlessly transitions from a global holographic map to a high-resolution satellite perspective with an overlaid "Ghost Border" targeting grid.
*   **Glassmorphic Tooltips**: Real-time tactical data drops down in frosted-glass tooltips adhering to specific design rules (12px backdrop blur, 40% opacity surface variants).

### 2. Intelligent Side Navigation (Frontend)
*   **Live Asset Feed**: Dynamically populates categorized lists of active **Naval** and **Aerial** contacts.
*   **Asset Details**: Displays generated `callsigns` (e.g., "X-RAY 492", "SIGMA 14"), abbreviated ID strings, velocities, and coordinates updated in real-time. (Note: Ground vehicles were explicitly removed to focus on specific domains).
*   **Target Interaction**: Clickable feed components driving the Map's Camera Dive lock-on mechanism.

### 3. Advanced Analytics Engine (Frontend & Backend)
*   **Telemetry Dashboard**: A dedicated `/analytics` route consuming aggregated data from the backend.
*   **KPI Readouts**: Total active assets, average/max velocity distributions.
*   **30-Day Detection Trend**: A stacked mini-bar chart visualizing chronological detection histories across domains.
*   **Sector Threat Matrix**: Real-time degradation reports and confidence scoring across grid sectors visualized with horizontal threat bars.
*   **System Health**: Diagnostic streams indicating API latency, websocket connection states, and inference scan frequencies.

### 4. Telemetry Heartbeat Service (Backend)
*   **WebSocket Stream**: Hosted on Port `8002` (migrated from `8001` to resolve Windows kernel zombie constraints), providing a `1.5s` heartbeat simulating live asset drift.
*   **Asset Simulation**: Seed data generating randomized movements and telemetry data for Naval and Aerial actors worldwide.

### 5. Neural Observer Object Detection (Backend)
*   **YOLOv11 Integration**: Houses a specialized analytical pipeline using `ultralytics` for satellite/aerial imagery analysis.
*   **Image Partitioning**: Algorithms that divide large GeoTIFFs/high-resolution PNGs into manageable tactical chips for the model to process.
*   **Change Detection Tooling**: Calculates Intersection over Union (IoU) across sequential frames to accurately flag *New Signatures* vs *Known Entities*. Priorities feed directly into frontend Alert Chips styled with "Instrumentation Glows."
*   **Mock Sentinel Hub API**: Stubs for fetching imagery localized to user-requested geographic bounded boxes or timestamps.

### 6. Production Deployment, Viewport HUD & Aviation Optimizations
*   **Vercel Cloud Integration**: Production deployment on Vercel (`aegisint.vercel.app`) using `.vercelignore` exclusions to bypass standard 500MB serverless Lambda size limits (ignoring heavy local Python dependencies). Added production environment configurations for Windy API & Mapbox GL JS.
*   **Disabled ISR**: Disabled ISR caching behaviors on heavy/dynamic pages to minimize Vercel runtime compute costs.
*   **Precision Viewport HUD Widget**: Integrated a custom, cyan-colored reset globe utility inside the viewport frame to zoom out to a complete global overview. Enhanced default map Zoom behavior to center zoom directly onto the mouse cursor, and placed real-time Latitude & Longitude coordinate tracking at the bottom dashboard controller.
*   **Branding & Initial Layer Controls**: Rebranded "Geoint Command" to "Aegis Command" and configured dashboard layers to remain disabled on boot by default (unless past user preferences exist).
*   **High-Performance Aviation Layers**: Scaled down flight markers to 14x14px SVGs for visual efficiency, optimized loading latency by applying pre-filtering on active military/commercial layers before limiting active DOM marker limits to 300 to maintain a smooth 60fps.


## Design System & UX Principles
*   **The "Kinetic Monolith"**: Strictly enforced UI rules requiring `0px` border radiuses for all containers and data boxes.
*   **Glass & Gradient Rule**: Implementation of `backdrop-blur(12px)` paired with deeply translucent dark palettes (`surface_variant`).
*   **Technical Typography**: Widespread use of monospace fonts (`font-mono`) and uppercase tagging.
*   **Micro-animations**: "Ping"/Pulse states on active targets, zebra-striped rapid-refresh tables, and precision absolute centering of targeting reticles logic without relying on erratic transforms.

## APIs & Libraries Used
**Frontend Environment**:
*   Next.js 16 (Turbopack)
*   React 19 (`use client` architectures, hooks)
*   Mapbox GL JS (`react-map-gl`, mapbox maps)
*   Tailwind CSS (Utility-first styling, absolute positioning models)

**Backend Environment**:
*   Python FastAPI (RESTful routing and comprehensive WebSockets)
*   Uvicorn (ASGI HTTP Server, handling the 8002 port instances)
*   Ultralytics YOLO (Computer vision framework)
*   Pillow & NumPy (Image chipping and matrix manipulations)
*   SQLAlchemy & GeoAlchemy2 (ORM and PostGIS integrations placeholder architecture)

## Endpoints Active
*   `GET /health`: Standard systemic boot-check.
*   `GET /api/analytics/summary`: Polling endpoint for aggregated dashboard trend matrices.
*   `WS /ws/global-surveillance`: High-frequency WebSocket protocol broadcasting atomic movements.
