// Kenya Gen Z demonstration hotspots — MapLibre GL JS.
// Render CRS: EPSG:3857 (MapLibre internal). Data CRS: EPSG:4326 ([lng, lat]).

// Colourblind-safe sequential palette: ColorBrewer "YlOrRd" (3-class),
// flagged colourblind-safe by ColorBrewer. Low intensity -> high intensity.
const LEVELS = {
  1: { color: "#ffeda0", radius: 6, label: "Notable protests reported" },
  2: { color: "#feb24c", radius: 10, label: "Significant, recurring" },
  3: { color: "#f03b20", radius: 15, label: "Epicenter / repeated large-scale" },
};

const map = new maplibregl.Map({
  container: "map",
  // CARTO Positron — open vector basemap, no access token required.
  style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  center: [37.9, 0.3], // [lng, lat] — Kenya
  zoom: 5.4,
  attributionControl: false,
});

// Explicit attribution control (basemap + thematic data source).
map.addControl(
  new maplibregl.AttributionControl({
    customAttribution:
      'Demonstration data: news reporting (illustrative) &middot; boundary: <a href="https://www.geoboundaries.org">geoBoundaries</a> (CC BY 4.0) &middot; basemap &copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),
  "bottom-right"
);
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

map.on("load", () => {
  // --- Kenya national boundary -------------------------------------------
  // Source: geoBoundaries gbOpen, KEN ADM0 (CC BY 4.0),
  // https://www.geoboundaries.org — downloaded to ./kenya.geojson (EPSG:4326).
  map.addSource("kenya", { type: "geojson", data: "kenya.geojson" });

  // Dark, prominent national outline.
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

  // --- Demonstration hotspots (drawn on top of the boundary) -------------
  map.addSource("hotspots", { type: "geojson", data: window.HOTSPOTS });

  // Visual hierarchy: base layer -> thematic points on top.
  // NOTE: GeoJSON is fine at this scale (<20 features). For >50k features,
  // upgrade delivery to vector tiles / PMTiles / FlatGeobuf instead of raw GeoJSON.
  map.addLayer({
    id: "hotspots-circles",
    type: "circle",
    source: "hotspots",
    paint: {
      "circle-radius": [
        "match",
        ["get", "level"],
        1, LEVELS[1].radius,
        2, LEVELS[2].radius,
        3, LEVELS[3].radius,
        6,
      ],
      "circle-color": [
        "match",
        ["get", "level"],
        1, LEVELS[1].color,
        2, LEVELS[2].color,
        3, LEVELS[3].color,
        "#cccccc",
      ],
      "circle-opacity": 0.8,
      "circle-stroke-width": 1.2,
      "circle-stroke-color": "#4d000c", // dark stroke for contrast on light basemap
    },
  });

  // Town labels above the circles.
  map.addLayer({
    id: "hotspots-labels",
    type: "symbol",
    source: "hotspots",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 11,
      "text-offset": [0, 1.4],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#333333",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.2,
    },
  });

  // Fit view to all hotspots.
  const lons = window.HOTSPOTS.features.map((f) => f.geometry.coordinates[0]);
  const lats = window.HOTSPOTS.features.map((f) => f.geometry.coordinates[1]);
  map.fitBounds(
    [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ],
    { padding: 60, duration: 0 }
  );

  // Popups on click.
  map.on("click", "hotspots-circles", (e) => {
    const p = e.features[0].properties;
    // GeoJSON props arrive as strings via MapLibre — parse the events array.
    const events = typeof p.events === "string" ? JSON.parse(p.events) : p.events;
    const eventsHtml = events.map((ev) => `<li>${ev}</li>`).join("");
    new maplibregl.Popup({ offset: 12 })
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(
        `<div class="hotspot-popup">
           <h3>${p.name}</h3>
           <p class="meta">${p.county} County</p>
           <ul>${eventsHtml}</ul>
         </div>`
      )
      .addTo(map);
  });

  map.on("mouseenter", "hotspots-circles", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "hotspots-circles", () => {
    map.getCanvas().style.cursor = "";
  });
});

// Build the legend (high -> low for readability).
const legend = document.getElementById("legend");
[3, 2, 1].forEach((lvl) => {
  const s = LEVELS[lvl];
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `<span class="swatch" style="background:${s.color}"></span>${s.label}`;
  legend.appendChild(row);
});
