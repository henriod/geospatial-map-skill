# Example — Kenya County Audit Explorer (Auditor-General 2023/2024)

An interactive choropleth of all 47 Kenyan counties, coloured by figures from the
**Auditor-General's Summary Report on County Governments, FY 2023/2024**, scaffolded
with the [`map-init`](../../skill/map-init/SKILL.md) skill.

Switch the dropdown to recolour the map by audit opinion, budget, revenue, pending
bills, or own-source-revenue performance. Hover for a tooltip; click a county for its
full figures.

**🔗 Live demo:** https://henriod.github.io/geospatial-map-skill/examples/Auditor-general-report/

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

No build step, no dependencies to install — MapLibre GL JS loads from a CDN.

To regenerate the joined dataset from source:

```bash
python3 data/build_data.py   # rebuilds data/kenya_counties_audit.geojson
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell — loads MapLibre GL JS + the metric switcher / legend / details panel |
| `map.js` | Map init (CARTO Positron), choropleth with quantile breaks, hover + click interactions |
| `style.css` | Full-viewport map + side-panel styling |
| `data/build_data.py` | Reproducible join of the audit figures onto GADM county boundaries |
| `data/kenya_counties_audit.geojson` | The joined dataset — 47 counties, EPSG:4326 |
| `data/gadm_tmp/gadm41_KEN_1.json` | Raw GADM 4.1 level-1 boundaries (source geometry) |
| `Auditor-Generals-…-2023-2024.pdf` | The source report all figures are transcribed from |

## Metrics

| Metric | Source | Encoding |
|--------|--------|----------|
| County Assembly audit opinion | Appendix 1(b) | Categorical (Okabe–Ito) |
| Total budget | Appendix 2 | Sequential blues |
| Actual revenue | Appendix 4 | Sequential blues |
| Pending bills | Appendix 3 | Sequential reds (more = worse) |
| Own-source revenue, % of target | Appendix 5 | Diverging RdYlBu |

## Data caveats

The boundaries are unmodified **GADM 4.1** geometry; the figures are transcribed from
the PDF appendices (Kenya Shillings). Two inconsistencies in the source are handled
honestly rather than papered over (see `data/build_data.py`):

- **Mombasa** and **Elgeyo/Marakwet** appear under *both* the Qualified and Adverse
  tables in Appendix 1(b) — the explicit Adverse table is treated as authoritative.
- **Homa Bay** and **Migori** are absent from every opinion category, so their
  assembly opinion is shown as **"Not listed"** (grey), not fabricated.

Every County Executive received a *Qualified* opinion, so that dimension is uniform
across the map (Appendix 1(a)).
