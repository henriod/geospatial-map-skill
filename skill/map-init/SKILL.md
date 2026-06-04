---
name: map-init
description: Initialize a new map project — scaffold a web map using MapLibre GL JS, set up a starting view (center, zoom, basemap), and add a first layer. Use when the user says "map init", "initialize a map", "scaffold a map", or wants to start a new mapping project.
---

# Map Init

Scaffold a new interactive web map and get it rendering, following open-source-first geospatial engineering standards.

## When to use

Trigger this when the user wants to start a fresh map project — there's no map yet
and they want a runnable starting point.

## Steps

1. **Confirm the essentials** (ask only if not already given):
   - Map library: **MapLibre GL JS** (default). Leaflet is acceptable for simple raster-only maps. Never use Mapbox GL unless the user explicitly requests it (requires a paid access token).
   - Initial view: center `[lng, lat]` and zoom level. Default to a world view (`[0, 0]`, zoom `2`) if unspecified.
   - Basemap (default: **CARTO Positron** via MapLibre style). Other acceptable defaults: CARTO Voyager, CARTO Dark Matter, OpenStreetMap raster, OpenTopoMap.
   - CRS context: web maps always render in **EPSG:3857**; all data exchange uses **EPSG:4326**.

2. **Scaffold the files** in the project root:
   - `index.html` — loads MapLibre GL JS (CDN), links `style.css` and `map.js`, includes a full-viewport `#map` container and source attribution.
   - `map.js` — initializes the MapLibre map, sets the view, adds the basemap style, adds one starter layer (e.g. a GeoJSON point at center, or a boundary outline from a verified source).
   - `style.css` — makes `#map` fill the viewport (`html, body, #map { height: 100%; margin: 0; padding: 0; }`).

3. **Wire the starter layer** so the map shows something meaningful on first load:
   - Use a verified data source — never fabricate or hardcode made-up coordinates as "sample data" without labeling them as placeholder.
   - If adding a boundary (admin area, AOI polygon), source it from **GADM**, **HDX**, or **OSM** — not guessed geometry.
   - If a marker/point is used as a starter placeholder, label it clearly as approximate/demo in the code comment.

4. **Apply cartographic defaults:**
   - Use colorblind-friendly palettes.
   - Include source attribution in the map (`attributionControl`).
   - Avoid rainbow color schemes, decorative 3D effects, and visual clutter.
   - Ensure visual hierarchy: base layer → contextual features → thematic data.

5. **Run it** to confirm it renders (e.g. `python3 -m http.server` then open the browser), and report the local URL.

## CRS Enforcement

- Web map renders in **EPSG:3857** (MapLibre handles this internally).
- All GeoJSON and coordinate inputs must be in **EPSG:4326** (lng, lat order).
- Never compute area, distance, or perimeter in EPSG:4326 — use an appropriate projected CRS for any analysis.

## Data Source Rules

For any geometry added during init:

| Feature type | Preferred source |
|---|---|
| Admin boundaries | GADM, official government datasets, HDX |
| Roads, settlements, POIs | OpenStreetMap (Geofabrik or Overpass API) |
| AOI polygons | User-provided or clearly labelled as placeholder |

Never invent or approximate geometry. If a location cannot be verified, omit it or label it `/* approximate — replace with verified geometry */`.

## Default Stack

- **Mapping**: MapLibre GL JS (CDN)
- **Basemap**: CARTO Positron (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`)
- **Data formats**: GeoJSON (starter), FlatGeobuf / GeoParquet for production scale
- **Backend (if needed)**: FastAPI + Python
- **Database (if needed)**: PostgreSQL + PostGIS

## Performance Defaults

For any layer added at init with anticipated scale >50k features:
- Plan for **Vector Tiles**, **PMTiles**, or **FlatGeobuf** — not raw GeoJSON served to the browser.
- Flag this in a code comment so the user knows to upgrade the data delivery approach.

## Notes

- Keep the scaffold minimal and dependency-light — CDN `<script>`/`<link>` tags are fine for the first pass; only introduce a bundler if the user asks.
- Never hardcode a Mapbox access token. If the user explicitly chooses Mapbox GL, prompt for the token rather than using a placeholder.
- For agricultural/climate/EO contexts, note in comments which EO indicators (NDVI, NDMI, EVI, SPI, etc.) or imagery sources (Sentinel-2, Landsat) are appropriate to add as the next layer.

## Decision Checklist (before delivering scaffold)

1. Is every coordinate in the starter layer verified or clearly labelled as placeholder?
2. Is the CRS correct — EPSG:4326 for data, EPSG:3857 for render?
3. Is the basemap attribution included?
4. Is the cartography purpose-driven and clutter-free?
5. Is the data source for any added geometry documented in a code comment?
6. Would a GIS professional trust this as a starting point?

If any answer is no, fix it before delivering.