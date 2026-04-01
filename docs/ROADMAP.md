# SAK-Geo Roadmap — Redefined

SAK-Geo is a **Core extension**, not an island.
All data comes from Sentinels Core API. Geo is a CONSUMER, not a source of truth.
NO own backend, NO Prisma, NO Fastify. Pure SPA consuming Core REST API.

```
User --> SAK-Geo (SPA) --> Sentinels Core API --> Database
              |                     |
              |                     +-- Projects, Sites, Placements
              |                     +-- Catalog, Definitions
              |                     +-- Scopes, ScopeLines
              |                     +-- DeploymentUnits, RuntimeBindings
              |                     +-- Commissioning
              |
              +-- Mapbox GL JS (tiles, geocoding)
```

---

## v0.1.0 — Clean Base (Wave 0) DONE

GeoJSON editor (geojson.io/next fork) with SAK-Geo branding.
Pure client-side, no backend. Docker+nginx deployment.

---

## v0.2.0 — Core Integration Foundation (Wave 1) DONE

Geo talks to Core API. Projects, sites, placements, catalog.

- [x] Core API client (`app/lib/core-api/`)
- [x] JWT auth against Core API (`POST /api/v1/auth/token/`)
- [x] Auth gate with token persistence + auto-refresh
- [x] Project picker (`GET /api/v1/projects/projects/`)
- [x] Site loader → GeoJSON (`GET /api/v1/projects/sites/`)
- [x] Placement loader → GeoJSON Points (`GET /api/v1/projects/placements/`)
- [x] Catalog sidebar (`GET /api/v1/catalog/items/`, `/definitions/definitions/`)
- [x] Save back: sites + placements (`PATCH`)
- [x] Config: `VITE_CORE_API_URL`
- [x] Demo mode preserved (`/demo` route)
- [x] SAK-Geo menu bar with user, logout, catalog, projects

---

## v0.3.0 — Device Placement on Map (Wave 2)

Place devices from Core catalog onto the map.

- [ ] Device placement mode: select from catalog → click map → POST placement
- [ ] Custom device markers per category (sensor, gateway, controller, etc.)
- [ ] Device info popup: click device → show specs from Definition
- [ ] Scope integration: show ScopeLines, track planned vs placed
- [ ] Drag-to-move placement → PATCH coordinates
- [ ] Delete placement from map → DELETE to Core API
- [ ] Visual: placed vs unplaced count per device type

---

## v0.4.0 — Coverage & Spatial Intelligence (Wave 3a)

- [ ] Client-side FSPL calculator (gateway coverage radius)
- [ ] Gateway range overlay circles on map
- [ ] Device-in-range query (Turf.js distance calculations)
- [ ] Gateway↔device connectivity lines
- [ ] Zone editor (draw compliance zones)
- [ ] Zone rules (max devices, required types, min separation)

---

## v0.5.0 — Floor Plans & Advanced Spatial (Wave 3b)

- [ ] Floor plan upload + georeferencing (corner pinning)
- [ ] Floor plan overlay on map
- [ ] Multi-floor support
- [ ] CloudRF API integration (optional, for accurate RF propagation)

---

## v0.6.0 — Pre-Provisioning Trigger (Wave 4)

- [ ] "Provision" button after devices are placed
- [ ] POST /api/v1/operations/deployment-units/bulk-provision/
- [ ] Provisioning progress + results display
- [ ] Device status badges (virtual/provisioned/active)

---

## v0.7.0 — Field Operations View (Wave 5)

- [ ] Commissioning overlay (color-coded by status)
- [ ] Field deployment routes on map
- [ ] Technician assignment visualization
- [ ] Click device → commissioning status + evidence from Core API
- [ ] Live status polling

---

## Version Policy

Stay at 0.x.x until the FULL end-to-end flow works.
v1.0.0 is reserved for when a real client deployment runs through the complete pipeline.
