# Example — Kenya Gen Z demonstration hotspots

An interactive map of Gen Z demonstration hotspots in Kenya, June 2024 → present, scaffolded with the [`map-init`](../../skill/map-init/SKILL.md) skill.

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

No build step, no dependencies to install — MapLibre GL JS loads from a CDN.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell — loads MapLibre GL JS + the title/legend panel |
| `map.js` | Map init (CARTO Positron), boundary + hotspot layers, popups, legend |
| `data.js` | GeoJSON `FeatureCollection` of hotspots, with a documented provenance header |
| `kenya.geojson` | Kenya ADM0 boundary from geoBoundaries (gbOpen, CC BY 4.0) |
| `style.css` | Full-viewport map + panel/popup styling |

## Data caveat

This is **illustrative, not analysis-grade** data — see the header in `data.js`. Coordinates are town centroids (not exact protest sites) and the intensity `level` is subjective editorial coding. For accurate analysis, swap in [ACLED Kenya](https://acleddata.com) event points.
