# SAK-Geo Roadmap

Built on a clean fork of [geojson.io/next](https://github.com/mapbox/geojson.io) (Placemark heritage).
Each version is a deployable milestone. No version ships without tests for its scope.

---

## v0.1.0 — Clean Base (CURRENT)

**Status: DONE**

The geojson.io GeoJSON editor running standalone with SAK-Geo branding.

- [x] Fork extraction: `/next` → root
- [x] SAK-Geo branding (index.html, package.json, README)
- [x] Vite config: `base: '/'`, output to `dist/`
- [x] Remove Mapbox analytics, CNAME, CI workflows
- [x] Dockerfile (multi-stage node+nginx)
- [x] docker-compose.yml with health check
- [x] nginx.conf (gzip, SPA fallback, /health)
- [x] License compliance (ISC + Placemark MIT attribution)
- [x] Build verified: 20.72s, 9.2MB

**What works:** Full GeoJSON editor — draw, edit, import/export 20+ formats, search, multi-select, bulk edit.

---

## v0.2.0 — API Foundation

**Goal:** Fastify + Prisma backend for project persistence. Replace MemPersistence with ApiPersistence.

- [ ] `api/` directory: Fastify 5 + Prisma + PostgreSQL + PostGIS
- [ ] Core Prisma models: Project, Feature, DeviceFamily, DeviceCatalogEntry
- [ ] API routes: health, projects CRUD, features CRUD
- [ ] ApiPersistence adapter (extends IPersistence)
- [ ] Project list page (home route)
- [ ] Project editor route (`/projects/:id`)
- [ ] Docker: add `sak-db` (PostGIS) + `sak-api` services
- [ ] Zod validation on all endpoints
- [ ] API tests with Vitest

---

## v0.3.0 — Device Catalog & Placement

**Goal:** IoT device taxonomy and map placement UX.

- [ ] Device families (sensors, cameras, gateways, actuators, etc.)
- [ ] Device catalog with models, brands, icons, default properties
- [ ] Device placement handler (click-to-place on map)
- [ ] Device info panel (properties editor)
- [ ] Device filter bar
- [ ] Device stats bar (counts by family)
- [ ] Custom map markers per device type
- [ ] Import/export devices as GeoJSON features with typed properties

---

## v0.4.0 — Zones & Compliance

**Goal:** Zone management and basic compliance rules.

- [ ] Zone editor (polygon/circle zones on map)
- [ ] Zone rules engine (max devices, required types, antenna separation)
- [ ] Compliance checker (RF emissions, ATEX zones, GDPR cameras)
- [ ] Zone visualization (color-coded overlays)
- [ ] API: zones CRUD, compliance check endpoint

---

## v0.5.0 — Floor Plans & Indoor

**Goal:** Indoor device placement with floor plan overlays.

- [ ] Floor plan upload and georeferencing (corner pinning)
- [ ] Floor plan overlay on map (opacity, lock, visibility)
- [ ] Indoor/outdoor toggle
- [ ] Multi-floor support
- [ ] API: floor plans CRUD

---

## v0.6.0 — Coverage Analysis

**Goal:** RF propagation and coverage visualization.

- [ ] Client-side FSPL (free-space path loss) calculator
- [ ] CloudRF integration for server-side RF propagation
- [ ] Python sidecar for GeoTIFF → GeoJSON processing
- [ ] Coverage overlay visualization (signal quality zones)
- [ ] Coverage cache with SHA-256 hash invalidation
- [ ] API: coverage endpoints + pg-boss batch worker

---

## v0.7.0 — Field Operations

**Goal:** Surveys, commissioning, deployment scheduling.

- [ ] Survey templates and instances
- [ ] Commissioning records with checklists
- [ ] Deployment schedule with calendar view
- [ ] Work orders with optimized routes
- [ ] API: surveys, commissioning, schedule, work-orders CRUD

---

## v0.8.0 — Intelligence Layer

**Goal:** Cable routing, interference detection, predictive analytics.

- [ ] Cable route editor (device-to-device routing)
- [ ] Route optimizer (shortest path, obstacle avoidance)
- [ ] Interference detector (co-channel, adjacent-channel)
- [ ] BOM generator (bill of materials from placed devices)
- [ ] Measurement tools (distance, area, elevation profile)
- [ ] Terrain and 3D visualization

---

## v0.9.0 — Collaboration

**Goal:** Multi-user features, sharing, comments.

- [ ] Annotations (photo, note, voice on map)
- [ ] Project snapshots (version history)
- [ ] Shared links with permissions
- [ ] Comments on features
- [ ] Real-time sync (WebSocket/SSE)

---

## v1.0.0 — Enterprise

**Goal:** Multi-tenant, auth, admin, portfolio.

- [ ] JWT + OIDC authentication
- [ ] Multi-tenant with organization/team model
- [ ] Admin dashboard (users, orgs, settings, audit log)
- [ ] Portfolio dashboard (cross-project analytics)
- [ ] Asset lifecycle management
- [ ] Plugin system
- [ ] Webhook system with HMAC-SHA256 signing
- [ ] IoT platform integrations (ThingsBoard, ChirpStack, MQTT)

---

## Principles

1. **Each version is deployable.** No partial features ship.
2. **Tests before features.** Every version includes tests for its scope.
3. **API-first.** Backend routes are designed and tested before frontend integration.
4. **Progressive enhancement.** geojson.io works standalone at v0.1; each version adds IoT capability.
5. **No dead code.** Features are implemented when they ship, not scaffolded early.
6. **Clean imports.** Each component knows its dependencies. No circular imports.
