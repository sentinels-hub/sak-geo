# SAK-Geo

**Sentinels Army Knife — Geo**: Device placement map tool for the Sentinels ecosystem.

Built on [geojson.io](https://github.com/mapbox/geojson.io) (Mapbox) / [Placemark](https://github.com/placemark/placemark) (Tom MacWright).

## Stack

- **Frontend**: React 18, TypeScript 5, Vite 7, Tailwind CSS 3
- **Maps**: Mapbox GL JS 3.17 + deck.gl 9
- **State**: Jotai 2
- **Editor**: CodeMirror 6, TipTap
- **Deploy**: Docker + nginx

## Quick Start

```bash
# Clone
git clone git@github.com:sentinels-hub/sak-geo.git
cd sak-geo

# Install
npm install

# Configure
cp .env.example .env
# Add your VITE_PUBLIC_MAPBOX_TOKEN

# Run
npm run dev
```

Open `http://localhost:5173`

## Docker

```bash
docker compose up -d --build
```

Open `http://localhost:8080`

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Development server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run test` | Lint + Vitest |
| `npm run knip` | Dead code detection |

## Features (upstream geojson.io)

- Create and edit GeoJSON (points, lines, polygons, rectangles, circles)
- Import/export: GeoJSON, KML, CSV, Shapefile, GPX, WKT, TopoJSON, and more
- Multi-select, bulk editing, spatial operations
- Keyboard shortcuts for efficient editing
- Query parameters for preloading data

## Attribution

Based on [geojson.io](https://geojson.io) by Mapbox, which uses code from [Placemark](https://github.com/placemark/placemark) by Tom MacWright. See [LICENSE](./LICENSE) for details.
