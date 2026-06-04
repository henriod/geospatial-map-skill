/* Kenya County Audit Explorer
 * ---------------------------
 * Choropleth of the 47 Kenyan counties driven by the Auditor-General's
 * County Governments 2023/2024 summary figures.
 *
 * CRS: MapLibre renders in EPSG:3857; the GeoJSON is EPSG:4326 (lng/lat).
 * Data volume: 47 polygons (~380 KB GeoJSON) — well below the threshold where
 * vector tiles / PMTiles / FlatGeobuf would be needed, so raw GeoJSON is fine.
 */

// --- Cartography: colourblind-friendly palettes -----------------------------
// Sequential single-hue ramps (ColorBrewer) read safely for most CVD types;
// the categorical ramp uses the Okabe–Ito qualitative palette.
const BLUES = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];
const REDS  = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"];
const RDYLBU = ["#d73027", "#fc8d59", "#fee090", "#91bfdb", "#4575b4"]; // low→high
const OPINION_COLORS = {
  "Unmodified": "#009E73",   // clean
  "Qualified":  "#E69F00",   // material findings
  "Adverse":    "#D55E00",   // pervasive misstatement
  "Not listed": "#9aa3ad",   // absent from Appendix 1(b) — not fabricated
};

// --- Value formatting -------------------------------------------------------
const fmtKsh = (v) => {
  if (v == null) return "—";
  if (v >= 1e9) return "KSh " + (v / 1e9).toFixed(2) + " B";
  if (v >= 1e6) return "KSh " + (v / 1e6).toFixed(1) + " M";
  return "KSh " + v.toLocaleString();
};
const fmtPct = (v) => (v == null ? "—" : v + "%");

// --- Metric definitions -----------------------------------------------------
const METRICS = {
  assembly_opinion: {
    label: "County Assembly audit opinion",
    desc: "Opinion issued on each County Assembly's financial statements (Appendix 1(b)). " +
          "Mombasa and Elgeyo/Marakwet received Adverse opinions; Homa Bay and Migori were not listed.",
    type: "categorical",
    format: (v) => v || "Not listed",
  },
  total_budget: {
    label: "Total budget (Exec + Assembly)",
    desc: "Approved budget for the financial year (Appendix 2).",
    type: "sequential", colors: BLUES, format: fmtKsh,
  },
  total_revenue: {
    label: "Actual total revenue",
    desc: "Revenue actually realised in FY 2023/2024 (Appendix 4).",
    type: "sequential", colors: BLUES, format: fmtKsh,
  },
  pending_bills: {
    label: "Pending bills (unpaid)",
    desc: "Outstanding bills as at 30 June 2024 (Appendix 3). Higher is worse — Nairobi alone owed over KSh 119 B.",
    type: "sequential", colors: REDS, format: fmtKsh,
  },
  osr_pct: {
    label: "Own-source revenue: % of target met",
    desc: "Actual own-source revenue as a share of the budgeted target (Appendix 5). " +
          "Red = far below target, blue = met or exceeded it.",
    type: "diverging", colors: RDYLBU, format: fmtPct,
  },
};

let map, geojson, currentMetric = "assembly_opinion", hoveredId = null, selectedId = null;

// --- Quantile breaks for a numeric metric -----------------------------------
function quantileBreaks(key, n = 5) {
  const vals = geojson.features
    .map((f) => f.properties[key])
    .filter((v) => v != null)
    .sort((a, b) => a - b);
  const breaks = [];
  for (let i = 1; i < n; i++) {
    breaks.push(vals[Math.floor((i / n) * vals.length)]);
  }
  return breaks; // n-1 break points → n classes
}

// Build a MapLibre fill-color expression for the active metric.
function colorExpression(metricKey) {
  const m = METRICS[metricKey];
  if (m.type === "categorical") {
    return [
      "match", ["get", metricKey],
      "Unmodified", OPINION_COLORS["Unmodified"],
      "Qualified",  OPINION_COLORS["Qualified"],
      "Adverse",    OPINION_COLORS["Adverse"],
      /* default (null / Not listed) */ OPINION_COLORS["Not listed"],
    ];
  }
  const breaks = quantileBreaks(metricKey, m.colors.length);
  const step = ["step", ["get", metricKey], m.colors[0]];
  breaks.forEach((b, i) => { step.push(b, m.colors[i + 1]); });
  // null-safe: counties with no value render grey rather than mis-binning.
  return ["case", ["==", ["get", metricKey], null], "#d9dde2", step];
}

// --- Legend -----------------------------------------------------------------
function renderLegend(metricKey) {
  const m = METRICS[metricKey];
  const el = document.getElementById("legend");
  let rows = "";
  if (m.type === "categorical") {
    ["Unmodified", "Qualified", "Adverse", "Not listed"].forEach((k) => {
      rows += `<div class="row"><span class="swatch" style="background:${OPINION_COLORS[k]}"></span>${k}</div>`;
    });
  } else {
    const breaks = quantileBreaks(metricKey, m.colors.length);
    const bounds = [null, ...breaks, null];
    m.colors.forEach((c, i) => {
      const lo = bounds[i], hi = bounds[i + 1];
      let lbl;
      if (lo == null) lbl = "< " + m.format(hi);
      else if (hi == null) lbl = "≥ " + m.format(lo);
      else lbl = m.format(lo) + " – " + m.format(hi);
      rows += `<div class="row"><span class="swatch" style="background:${c}"></span>${lbl}</div>`;
    });
  }
  el.innerHTML = `<h3>${m.label}</h3>${rows}`;
}

// --- Details panel ----------------------------------------------------------
function renderDetails(p) {
  const el = document.getElementById("details");
  if (!p) { el.innerHTML = '<p class="hint">Click a county to see its audit figures.</p>'; return; }
  const ao = p.assembly_opinion || "Not listed";
  const tag = OPINION_COLORS[ao] || OPINION_COLORS["Not listed"];
  const osr = p.osr_actual != null
    ? `${fmtKsh(p.osr_actual)} <span style="color:#8a93a1">of ${fmtKsh(p.osr_budgeted)} (${fmtPct(p.osr_pct)})</span>`
    : "—";
  el.innerHTML = `
    <h2>${p.county}</h2>
    <span class="opinion-tag" style="background:${tag}">Assembly: ${ao}</span>
    <table>
      <tr><td class="k">Executive opinion</td><td class="v">${p.executive_opinion}</td></tr>
      <tr><td class="k">Total budget</td><td class="v">${fmtKsh(p.total_budget)}</td></tr>
      <tr><td class="k">Actual revenue</td><td class="v">${fmtKsh(p.total_revenue)}</td></tr>
      <tr><td class="k">Pending bills</td><td class="v">${fmtKsh(p.pending_bills)}</td></tr>
      <tr><td class="k">Own-source revenue</td><td class="v">${osr}</td></tr>
    </table>`;
}

// --- Apply the active metric to the map -------------------------------------
function applyMetric(metricKey) {
  currentMetric = metricKey;
  map.setPaintProperty("counties-fill", "fill-color", colorExpression(metricKey));
  document.getElementById("metric-desc").textContent = METRICS[metricKey].desc;
  renderLegend(metricKey);
}

// --- Boot -------------------------------------------------------------------
async function init() {
  geojson = await fetch("data/kenya_counties_audit.geojson").then((r) => r.json());

  map = new maplibregl.Map({
    container: "map",
    // CARTO Positron — neutral light basemap that lets the thematic layer lead.
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    center: [37.9, 0.3],   // EPSG:4326 — central Kenya
    zoom: 5.4,
    attributionControl: true,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.AttributionControl({
    customAttribution: "Boundaries © GADM 4.1 · Data: Office of the Auditor-General (Kenya) 2023/2024",
  }));

  // Populate the metric dropdown.
  const sel = document.getElementById("metric");
  Object.entries(METRICS).forEach(([k, m]) => {
    const opt = document.createElement("option");
    opt.value = k; opt.textContent = m.label; sel.appendChild(opt);
  });
  sel.value = currentMetric;
  sel.addEventListener("change", (e) => applyMetric(e.target.value));

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

  map.on("load", () => {
    map.addSource("counties", { type: "geojson", data: geojson, generateId: true });

    // Visual hierarchy: basemap → county fills (thematic) → county outlines.
    map.addLayer({
      id: "counties-fill", type: "fill", source: "counties",
      paint: {
        "fill-color": colorExpression(currentMetric),
        "fill-opacity": [
          "case", ["boolean", ["feature-state", "hover"], false], 0.95, 0.78,
        ],
      },
    });
    map.addLayer({
      id: "counties-line", type: "line", source: "counties",
      paint: {
        "line-color": "#384350",
        "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.4, 0.5],
      },
    });

    applyMetric(currentMetric);

    // Hover: highlight + lightweight tooltip with the active metric value.
    map.on("mousemove", "counties-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features[0];
      if (hoveredId !== null) map.setFeatureState({ source: "counties", id: hoveredId }, { hover: false });
      hoveredId = f.id;
      map.setFeatureState({ source: "counties", id: hoveredId }, { hover: true });
      const m = METRICS[currentMetric];
      const val = m.format(f.properties[currentMetric]);
      popup.setLngLat(e.lngLat)
        .setHTML(`<strong>${f.properties.county}</strong>${m.label}: ${val}`)
        .addTo(map);
    });
    map.on("mouseleave", "counties-fill", () => {
      map.getCanvas().style.cursor = "";
      if (hoveredId !== null) map.setFeatureState({ source: "counties", id: hoveredId }, { hover: false });
      hoveredId = null;
      popup.remove();
    });

    // Click: select + populate the details panel.
    map.on("click", "counties-fill", (e) => {
      const f = e.features[0];
      if (selectedId !== null) map.setFeatureState({ source: "counties", id: selectedId }, { selected: false });
      selectedId = f.id;
      map.setFeatureState({ source: "counties", id: selectedId }, { selected: true });
      renderDetails(f.properties);
    });
  });
}

init();
