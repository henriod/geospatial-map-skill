/*
 * Kenya Gen Z demonstration hotspots, June 2024 -> present.
 *
 * FORMAT: GeoJSON FeatureCollection, CRS EPSG:4326, coordinates in [lng, lat]
 * order (RFC 7946). MapLibre reprojects to EPSG:3857 for rendering internally.
 *
 * DATA PROVENANCE / SOURCES:
 *   - Coordinates: approximate town / county centroids (verifiable via the
 *     GeoNames gazetteer, https://www.geonames.org). NOT exact protest sites.
 *   - Events & locations: compiled from public news reporting of the 2024
 *     anti-Finance Bill ("Reject Finance Bill") protests, the 25 Jun 2025
 *     anniversary, and the 7 Jul 2025 Saba Saba demonstrations (e.g. coverage
 *     by Reuters, BBC, Citizen Digital, Nation, The Standard).
 *   - `level` (intensity, 1-3): SUBJECTIVE editorial coding by the author of
 *     this file — it is NOT a verified turnout/casualty index. Replace with a
 *     sourced dataset (e.g. ACLED Kenya, https://acleddata.com) for analysis.
 *
 * APPROXIMATE DATA — replace point geometry & intensity with verified data
 * (ACLED event points + counts) before drawing analytical conclusions.
 *
 * This is a starter dataset — edit / extend freely.
 */
window.HOTSPOTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.8172, -1.2864] },
      properties: {
        name: "Nairobi",
        county: "Nairobi",
        level: 3,
        events: [
          "18-20 Jun 2024: 'Reject Finance Bill' marches in the CBD",
          "25 Jun 2024: Parliament stormed during nationwide protests",
          "Jul 2024: 'Ruto Must Go' / anti-corruption marches",
          "25 Jun 2025: one-year anniversary protests",
          "7 Jul 2025: Saba Saba demonstrations",
        ],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [39.6682, -4.0435] },
      properties: {
        name: "Mombasa",
        county: "Mombasa",
        level: 3,
        events: [
          "Jun 2024: large anti-Finance Bill protests along Moi & Nyerere Ave",
          "2025: recurring Gen Z solidarity marches",
        ],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [34.768, -0.0917] },
      properties: {
        name: "Kisumu",
        county: "Kisumu",
        level: 3,
        events: [
          "Jun 2024: major protests in the CBD",
          "Jun-Jul 2025: anniversary & Saba Saba demonstrations",
        ],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.08, -0.3031] },
      properties: {
        name: "Nakuru",
        county: "Nakuru",
        level: 2,
        events: ["Jun 2024 & 2025: town-centre marches and running battles"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [35.2698, 0.5143] },
      properties: {
        name: "Eldoret",
        county: "Uasin Gishu",
        level: 2,
        events: ["Jun 2024: anti-Finance Bill protests in the CBD"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.9476, -0.4201] },
      properties: {
        name: "Nyeri",
        county: "Nyeri",
        level: 2,
        events: ["Jun 2024 & 2025: Mt Kenya region demonstrations"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [34.768, -0.6817] },
      properties: {
        name: "Kisii",
        county: "Kisii",
        level: 2,
        events: ["Jun 2024: protests; among areas with reported casualties"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [34.7519, 0.2827] },
      properties: {
        name: "Kakamega",
        county: "Kakamega",
        level: 2,
        events: ["Jun 2024 & 2025: western-region marches"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.6559, 0.0463] },
      properties: {
        name: "Meru",
        county: "Meru",
        level: 2,
        events: ["Jun 2024: CBD protests"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.0693, -1.0333] },
      properties: {
        name: "Thika",
        county: "Kiambu",
        level: 2,
        events: ["Jun 2024 & 2025: industrial-town protests on Thika Road"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [36.8356, -1.1714] },
      properties: {
        name: "Kiambu / Kikuyu",
        county: "Kiambu",
        level: 2,
        events: ["Jun 2025: Mt Kenya foothill demonstrations"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.4575, -0.531] },
      properties: {
        name: "Embu",
        county: "Embu",
        level: 1,
        events: ["Jun 2024: town-centre protests"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.2634, -1.5177] },
      properties: {
        name: "Machakos",
        county: "Machakos",
        level: 1,
        events: ["Jun 2024: protests in the CBD"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.0731, 0.0167] },
      properties: {
        name: "Nanyuki",
        county: "Laikipia",
        level: 1,
        events: ["Jun 2024: demonstrations reported"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [39.6583, -0.4569] },
      properties: {
        name: "Garissa",
        county: "Garissa",
        level: 1,
        events: ["Jun 2024: north-eastern solidarity protests"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [35.2831, -0.3689] },
      properties: {
        name: "Kericho",
        county: "Kericho",
        level: 1,
        events: ["Jun 2024: rift-valley protests"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [35.0062, 1.0157] },
      properties: {
        name: "Kitale",
        county: "Trans Nzoia",
        level: 1,
        events: ["Jun 2024: town protests"],
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [37.28, -0.4986] },
      properties: {
        name: "Kerugoya",
        county: "Kirinyaga",
        level: 1,
        events: ["Jun 2025: Mt Kenya region demonstrations"],
      },
    },
  ],
};
