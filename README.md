# geospatial-map-skill

A [Claude Code](https://claude.com/claude-code) **Skill** that scaffolds standards-compliant interactive web maps — and a worked example that builds a map of Kenya's Gen&nbsp;Z demonstration hotspots from June&nbsp;2024 to the present.

The skill, `map-init`, encodes open-source-first geospatial engineering standards so that every map you scaffold uses the right stack, the right coordinate reference systems, and **verified** data sources by default — no Mapbox tokens, no fabricated coordinates, no rainbow ramps.

---

## What's in here

```
.
├── skill/
│   └── map-init/
│       └── SKILL.md                  ← the reusable Claude Code skill
├── examples/
│   └── kenya-genz-protests/          ← a complete map built with the skill
│       ├── index.html
│       ├── map.js
│       ├── data.js                   ← GeoJSON hotspots (provenance documented)
│       ├── kenya.geojson             ← verified ADM0 boundary (geoBoundaries)
│       └── style.css
├── docs/
│   └── walkthrough.md                ← step-by-step blog/tutorial
├── LICENSE
└── README.md
```

---

## What the skill does

When you type `/map-init <description>`, Claude scaffolds a runnable web map following these defaults:

| Concern | Default | Why |
|---|---|---|
| **Library** | MapLibre GL JS | Open source, no access token (never Mapbox unless asked) |
| **Basemap** | CARTO Positron | Clean open vector style |
| **Data CRS** | EPSG:4326 `[lng, lat]` | RFC 7946 GeoJSON standard |
| **Render CRS** | EPSG:3857 | Web-map standard (handled by MapLibre) |
| **Geometry** | GADM / HDX / OSM / geoBoundaries | **Never** invent coordinates as fake "sample data" |
| **Cartography** | Colourblind-safe palettes, attribution, visual hierarchy | No rainbow schemes, no 3D clutter |

It also ships a **decision checklist** so the output can be audited — you can literally ask Claude *"is this up to skill?"* and get a compliance report.

---

## Quick start

### 1. Install the skill

Copy the skill into your project's (or your global) Claude Code skills directory:

```bash
# project-local (this repo / project only)
mkdir -p .claude/skills
cp -R skill/map-init .claude/skills/

# — or — globally, for every project
mkdir -p ~/.claude/skills
cp -R skill/map-init ~/.claude/skills/
```

Claude Code discovers skills in `.claude/skills/` automatically — no restart needed.

### 2. Use it

Open Claude Code in your project and run the slash command with a description:

```
/map-init map of protest hotspots in kenya since june 2024
```

Claude scaffolds `index.html`, `map.js`, `data.js`, and `style.css`, then serves the map and reports the local URL.

### 3. Run the included example

No Claude Code required to view the finished demo:

```bash
cd examples/kenya-genz-protests
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

You get a map of Kenya with a dark national boundary and circle markers sized/coloured by protest intensity. Click any marker for that town's protest timeline.

---

## About the example data

The Kenya example is **illustrative, not analysis-grade**, and says so explicitly in `data.js`:

- **Coordinates** — town/county centroids (verifiable via [GeoNames](https://www.geonames.org)), *not* exact protest sites.
- **Events** — compiled from public news reporting (Reuters, BBC, Nation, etc.).
- **Intensity (`level` 1–3)** — subjective editorial coding, **not** a verified turnout/fatality index.
- **Upgrade path** — swap in [ACLED Kenya](https://acleddata.com) event points for accurate coordinates, dates, and counts.
- **Boundary** — Kenya ADM0 from [geoBoundaries](https://www.geoboundaries.org) (gbOpen, CC&nbsp;BY&nbsp;4.0).

This honesty about provenance is a core rule of the skill, not an afterthought.

---

## Read the walkthrough

[`docs/walkthrough.md`](docs/walkthrough.md) tells the full story: setting up the skill, generating the map, auditing it against the standards, migrating Leaflet → MapLibre, and adding the verified boundary.

---

## License & attribution

- **Code & skill**: [MIT](LICENSE).
- **`examples/kenya-genz-protests/kenya.geojson`**: © [geoBoundaries](https://www.geoboundaries.org), licensed **CC BY 4.0** — attribution retained in the map and here.
- Basemap © [CARTO](https://carto.com/attributions) & © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

---

*Built with [Claude Code](https://claude.com/claude-code).*
