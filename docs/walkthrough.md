# Building a Kenya Protest Map with a Claude Code Skill

*How to install a custom `map-init` skill and use it to scaffold a standards-compliant interactive web map — from an empty folder to a MapLibre map of Kenya's Gen Z demonstration hotspots.*

---

## What we're building

A single-page interactive web map showing **Gen Z demonstration hotspots in Kenya from June 2024 to the present**. It uses:

- **MapLibre GL JS** — open-source vector mapping, no API token
- **CARTO Positron** — clean open basemap
- **GeoJSON** data in EPSG:4326, rendered in EPSG:3857
- A **dark national boundary** outline sourced from geoBoundaries
- Colourblind-safe **ColorBrewer** styling, sized by protest intensity

The twist: we didn't write the boilerplate by hand. We used a **Claude Code Skill** called `map-init` that knows our team's geospatial standards and scaffolds the whole thing for us.

---

## Part 1 — What is a Skill?

A **Skill** is a reusable instruction file (`SKILL.md`) that teaches Claude Code how to do a specific task *your way*. Instead of re-explaining "use MapLibre, not Mapbox; put data in EPSG:4326; never invent coordinates" every time, you encode it once. When you type `/map-init`, Claude loads those rules and follows them.

A skill is just a folder with a Markdown file:

```
.claude/
└── skills/
    └── map-init/
        └── SKILL.md
```

The `SKILL.md` starts with YAML frontmatter — a `name` and a `description` that tells Claude *when* to use it:

```markdown
---
name: map-init
description: Initialize a new map project — scaffold a web map using
  MapLibre GL JS, set up a starting view (center, zoom, basemap), and add a
  first layer. Use when the user says "map init", "initialize a map",
  "scaffold a map", or wants to start a new mapping project.
---

# Map Init

Scaffold a new interactive web map and get it rendering, following
open-source-first geospatial engineering standards.

## Steps
1. Confirm the essentials (library, view, basemap)...
2. Scaffold index.html, map.js, style.css...
3. Wire a starter layer from a *verified* data source...
...
```

Everything below the frontmatter is the playbook. Our `map-init` skill encodes opinions like:

- **Default to MapLibre GL JS** (Leaflet only for simple raster maps; never Mapbox without a token)
- **Default basemap: CARTO Positron**
- **CRS discipline**: data in `[lng, lat]` EPSG:4326, render in EPSG:3857
- **Never fabricate geometry** — pull boundaries from GADM / HDX / OSM / geoBoundaries, or clearly label placeholders
- **Cartographic defaults** — colourblind-safe palettes, attribution, visual hierarchy, no rainbow/3D clutter

---

## Part 2 — Set up the skill

### Step 1: Create the skill folder

From your project root:

```bash
mkdir -p .claude/skills/map-init
```

> **Project vs. global:** putting the skill in `./.claude/skills/` makes it available in *this* project. To reuse it everywhere, put it in `~/.claude/skills/` instead.

### Step 2: Add `SKILL.md`

Create `.claude/skills/map-init/SKILL.md` with the frontmatter and playbook (see Part 1). The two things that matter most:

1. A clear **`description`** with trigger phrases — this is how Claude decides to load it.
2. **Concrete, opinionated steps** — the more specific the standards, the more consistent the output.

### Step 3: Confirm Claude can see it

Start Claude Code in the project and type `/`. You should see `map-init` in the skill list. That's it — no install, no restart. Skills are picked up from the `.claude/skills/` directory automatically.

---

## Part 3 — Generate the map

### Step 1: Invoke the skill

In Claude Code, type the slash command with a description of what you want:

```
/map-init map of genz demonstration hotspots in kenya since june 2024 to date
```

Claude loads the skill, applies the defaults, and scaffolds four files in the project root:

| File | Purpose |
|------|---------|
| `index.html` | Loads MapLibre GL JS (CDN) + a full-viewport `#map`, plus a title/legend panel |
| `map.js` | Initialises the map over Kenya, adds CARTO Positron, plots hotspots, builds the legend |
| `data.js` | A GeoJSON `FeatureCollection` of demonstration hotspots with dated events |
| `style.css` | Full-viewport map + styled info panel and popups |

### Step 2: Run it

The skill serves the project and reports the URL:

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

You immediately get a map of Kenya with circle markers sized and coloured by protest intensity — click any marker for that town's protest timeline (the June 2024 Finance Bill marches, the June 25 storming of Parliament, the 2025 anniversary, Saba Saba, and more).

### A note on honesty in data

The skill **forbids inventing coordinates as fake "sample data."** So the scaffolded `data.js` carries an explicit provenance header:

- **Coordinates** = town/county centroids, verifiable via GeoNames (not exact protest sites)
- **Events** = compiled from public news reporting (Reuters, BBC, Nation, etc.)
- **Intensity (`level` 1–3)** = clearly labelled as *subjective editorial coding*, with **ACLED Kenya** flagged as the upgrade path for analysis-grade data

```js
window.HOTSPOTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.8172, -1.2864] }, // [lng, lat]
      properties: {
        name: "Nairobi",
        county: "Nairobi",
        level: 3,
        events: [
          "18-20 Jun 2024: 'Reject Finance Bill' marches in the CBD",
          "25 Jun 2024: Parliament stormed during nationwide protests",
          "25 Jun 2025: one-year anniversary protests",
          "7 Jul 2025: Saba Saba demonstrations",
        ],
      },
    },
    // ...17 more towns
  ],
};
```

---

## Part 4 — Iterate with the skill's standards as a guardrail

The real power shows up when you **review and refine**. Because the standards live in the skill, you can ask Claude to audit its own work against them.

### Review: "is this up to skill?"

Running `/map-init review the current if it's up to skill` produced a checklist audit. It caught that the *first* version used **Leaflet** (an older default) instead of MapLibre, and that the data used `[lat, lng]` instead of GeoJSON's `[lng, lat]`. We chose a **full migration**, which:

- Swapped Leaflet → **MapLibre GL JS**
- Swapped OSM raster → **CARTO Positron** vector style
- Converted the data to a proper **GeoJSON FeatureCollection** in `[lng, lat]`
- Applied a **ColorBrewer YlOrRd** colourblind-safe palette
- Documented every data source in code comments

> A bug got caught here too: a nested `*/` inside a comment block had broken `data.js` as JavaScript. A quick `node` parse check during review surfaced it before it ever hit the browser.

### Add a verified boundary

> *"make kenya boundary visible more — use a darker color"*

The skill's rules say **don't hand-draw geometry**. So instead of guessing a polygon, Claude downloaded Kenya's official ADM0 boundary from **geoBoundaries** (gbOpen, CC BY 4.0):

```bash
# resolve + download the verified national boundary
curl -s "https://www.geoboundaries.org/api/current/gbOpen/KEN/ADM0/" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);\
process.stdin.on('end',()=>console.log(JSON.parse(d).gjDownloadURL))" \
  | xargs curl -sL -o kenya.geojson
```

Then added it as a dark outline layer, drawn *beneath* the hotspots to keep the visual hierarchy (basemap → boundary → data):

```js
map.addSource("kenya", { type: "geojson", data: "kenya.geojson" });

map.addLayer({
  id: "kenya-outline",
  type: "line",
  source: "kenya",
  layout: { "line-join": "round" },
  paint: {
    "line-color": "#1b2631", // dark slate
    "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.8, 7, 3.2],
    "line-opacity": 0.9,
  },
});
```

The boundary attribution was added to the map's `AttributionControl` automatically — because the skill requires it.

---

## The finished project

```
map-skil-test/
├── .claude/
│   └── skills/
│       └── map-init/
│           └── SKILL.md       ← the reusable playbook
├── index.html                 ← MapLibre app shell
├── map.js                     ← map init + layers + legend
├── data.js                    ← GeoJSON hotspots (provenance documented)
├── kenya.geojson              ← verified ADM0 boundary (geoBoundaries)
└── style.css                  ← full-viewport styling
```

Run it any time with:

```bash
python3 -m http.server 8000
# → http://localhost:8000/index.html
```

---

## Why use a skill instead of just prompting?

| Plain prompting | Using a skill |
|---|---|
| Re-explain standards every session | Standards encoded once, applied every time |
| Inconsistent library/CRS choices | MapLibre + EPSG discipline by default |
| Risk of fabricated "sample" data | Verified-source rule baked in |
| Cartography is hit-or-miss | Colourblind-safe palette + attribution enforced |
| Hard to audit | "Is this up to skill?" becomes a real check |

A skill turns scattered preferences into a **repeatable, auditable engineering standard** — and the slash command makes it a one-liner.

---

## Next steps you could try

- **Time slider** — scrub June 2024 → 2025 and watch hotspots appear by date
- **Swap in ACLED data** — real event points, dates, and counts for analysis-grade accuracy
- **Simplify the boundary** — `kenya.geojson` is 1.3 MB at full resolution; topology-preserving simplification can shrink it to ~50 KB for faster loads
- **Add a heatmap layer** as an alternative to discrete markers

---

*Built with [Claude Code](https://claude.com/claude-code) and a custom `map-init` skill.*
