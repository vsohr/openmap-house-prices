# UK House Price Map - Implementation Plan

Reference: [Design Document](./2026-02-14-house-price-map-design.md)

---

## Phase 1: Project Scaffolding

### Task 1.1 - Initialize Vite + React + TypeScript project

**Files created:** Project root configuration files

```bash
npm create vite@latest . -- --template react-ts
```

This generates:
- `package.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- `src/index.css`, `src/App.css`

### Task 1.2 - Install dependencies

**File modified:** `package.json`

```bash
# Core
npm install react@^19.2.0 react-dom@^19.2.0

# Mapping
npm install leaflet@^1.9.4 react-leaflet@^5.0.0

# Charts
npm install recharts@^3.7.0

# Styling (Tailwind CSS v4 with Vite plugin)
npm install tailwindcss@^4.1.0 @tailwindcss/vite@^4.1.0

# Dev dependencies
npm install -D @types/react@^19.0.0 @types/react-dom@^19.0.0 @types/leaflet@^1.9.0
npm install -D typescript@^5.7.0 vite@^6.2.0 @vitejs/plugin-react@^4.4.0

# Data pipeline tools (dev only)
npm install -D csv-parser@^3.2.0 @types/csv-parser@^1.0.0
```

**Verification:** `npm ls --depth=0` shows all packages installed without peer dependency errors.

### Task 1.3 - Configure Vite with Tailwind v4

**File modified:** `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Task 1.4 - Configure Tailwind CSS v4

**File modified:** `src/index.css`

Replace the generated contents with:

```css
@import "tailwindcss";

/* Leaflet requires its own CSS - import in main.tsx instead */
```

**File modified:** `src/main.tsx`

```tsx
import "leaflet/dist/leaflet.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Task 1.5 - Configure TypeScript strictly

**File modified:** `tsconfig.app.json`

Ensure these compiler options are set:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Task 1.6 - Create directory structure

```
src/
  components/
    Map/
    Sidebar/
    Controls/
  context/
  hooks/
  types/
  utils/
public/
  data/
    trends/
scripts/
```

**Verification:** Run `npm run dev` -- the Vite dev server should start on localhost and show the default React page.

### Task 1.7 - Delete generated boilerplate

**Files deleted:**
- `src/App.css`
- `src/assets/react.svg`
- `public/vite.svg`

**File modified:** `src/App.tsx` -- replace contents with a minimal placeholder:

```tsx
export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">
        UK House Price Map
      </h1>
    </div>
  );
}
```

**Verification:** Page shows "UK House Price Map" with Tailwind styling applied.

---

## Phase 2: TypeScript Types and Utilities

### Task 2.1 - Define core types

**File created:** `src/types/index.ts`

```ts
/** Property type codes from Land Registry PPD */
export type PropertyType = "D" | "S" | "T" | "F" | "O";

/** Human-readable property type labels */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  D: "Detached",
  S: "Semi-detached",
  T: "Terraced",
  F: "Flat/Maisonette",
  O: "Other",
};

/** Color modes for the choropleth */
export type ColorMode = "price" | "growth";

/** Application state shape */
export interface AppState {
  selectedDistrict: string | null;
  colorMode: ColorMode;
  propertyTypeFilter: PropertyType | "all";
  yearRange: [number, number];
}

/** Actions for the state reducer */
export type AppAction =
  | { type: "SELECT_DISTRICT"; district: string | null }
  | { type: "SET_COLOR_MODE"; mode: ColorMode }
  | { type: "SET_PROPERTY_TYPE_FILTER"; propertyType: PropertyType | "all" }
  | { type: "SET_YEAR_RANGE"; range: [number, number] };

/** Stats stored per district in the summary GeoJSON properties */
export interface DistrictProperties {
  code: string;
  name: string;
  avgPrice: number;
  medianPrice: number;
  transactionCount: number;
  yoyChange: number; // percentage, e.g. 3.2 means +3.2%
  latestYear: number;
  byType: Record<PropertyType, { avgPrice: number; count: number }>;
}

/** Per-year stats in the detailed trend file */
export interface YearlyStats {
  year: number;
  avgPrice: number;
  medianPrice: number;
  transactionCount: number;
  yoyChange: number | null; // null for first year
  byType: Record<PropertyType, { avgPrice: number; count: number }>;
}

/** Shape of trends/{district-code}.json */
export interface DistrictTrend {
  code: string;
  name: string;
  years: YearlyStats[];
}

/** GeoJSON feature for a district */
export interface DistrictFeature
  extends GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon, DistrictProperties> {}

/** The entire summary GeoJSON file */
export interface DistrictSummaryGeoJSON
  extends GeoJSON.FeatureCollection<GeoJSON.MultiPolygon | GeoJSON.Polygon, DistrictProperties> {}
```

### Task 2.2 - Create color utility

**File created:** `src/utils/colors.ts`

```ts
import type { ColorMode, DistrictProperties } from "../types";

/** Color stops for price mode (green -> yellow -> red) */
const PRICE_STOPS: [number, string][] = [
  [50_000, "#1a9850"],   // green - low
  [150_000, "#91cf60"],
  [250_000, "#d9ef8b"],
  [350_000, "#fee08b"],  // yellow - mid
  [500_000, "#fc8d59"],
  [750_000, "#d73027"],  // red - high
  [1_500_000, "#a50026"],
];

/** Color stops for YoY growth mode (red negative -> white zero -> green positive) */
const GROWTH_STOPS: [number, string][] = [
  [-10, "#d73027"],
  [-5, "#fc8d59"],
  [0, "#ffffbf"],
  [5, "#91cf60"],
  [10, "#1a9850"],
];

function interpolateColor(value: number, stops: [number, string][]): string {
  if (value <= stops[0][0]) return stops[0][1];
  if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];

  for (let i = 0; i < stops.length - 1; i++) {
    const [lowVal, lowColor] = stops[i];
    const [highVal, highColor] = stops[i + 1];
    if (value >= lowVal && value <= highVal) {
      const t = (value - lowVal) / (highVal - lowVal);
      return lerpHex(lowColor, highColor, t);
    }
  }
  return stops[stops.length - 1][1];
}

function lerpHex(a: string, b: string, t: number): string {
  const parseHex = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bVal = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bVal.toString(16).padStart(2, "0")}`;
}

export function getDistrictColor(
  props: DistrictProperties,
  colorMode: ColorMode
): string {
  if (colorMode === "price") {
    return interpolateColor(props.avgPrice, PRICE_STOPS);
  }
  return interpolateColor(props.yoyChange, GROWTH_STOPS);
}

export function getLegendStops(colorMode: ColorMode): [number, string][] {
  return colorMode === "price" ? PRICE_STOPS : GROWTH_STOPS;
}
```

### Task 2.3 - Create formatter utility

**File created:** `src/utils/formatters.ts`

```ts
/** Format a number as GBP currency, e.g. 250000 -> "£250,000" */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact price for legend/labels, e.g. 250000 -> "£250K", 1200000 -> "£1.2M" */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `£${Math.round(value / 1_000)}K`;
  }
  return `£${value}`;
}

/** Format a percentage with sign, e.g. 3.2 -> "+3.2%", -1.5 -> "-1.5%" */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Format a number with commas, e.g. 1234 -> "1,234" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}
```

**Verification:** Types compile without errors: `npx tsc --noEmit`.

---

## Phase 3: Data Pipeline Scripts

### Overview

The data pipeline runs locally as a one-time process to produce static JSON files. It processes ~4GB of CSV data and outputs:
- `public/data/districts-summary.geojson` (~500KB) -- all districts with latest-year stats
- `public/data/trends/{DISTRICT_CODE}.json` (~2KB each, ~2,800 files) -- yearly detail

### Data Sources

| Source | URL | File |
|--------|-----|------|
| Land Registry PPD (complete) | `http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv` | ~4.3GB CSV |
| UK Postcode District Polygons | `https://github.com/missinglink/uk-postcode-polygons` | GeoJSON files per postcode area |

### Task 3.1 - Create download script

**File created:** `scripts/download-data.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="scripts/raw-data"
mkdir -p "$DATA_DIR"

echo "=== Downloading Land Registry Price Paid Data (complete) ==="
echo "This file is ~4.3GB and may take a while..."
curl -L -o "$DATA_DIR/pp-complete.csv" \
  "http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv"

echo ""
echo "=== Downloading UK Postcode District Polygons ==="
if [ ! -d "$DATA_DIR/uk-postcode-polygons" ]; then
  git clone --depth 1 https://github.com/missinglink/uk-postcode-polygons.git "$DATA_DIR/uk-postcode-polygons"
else
  echo "Already cloned, skipping."
fi

echo ""
echo "=== Downloads complete ==="
echo "Land Registry CSV: $DATA_DIR/pp-complete.csv"
echo "Postcode polygons: $DATA_DIR/uk-postcode-polygons/geojson/"
```

### Task 3.2 - Create the aggregation pipeline script

**File created:** `scripts/process-data.ts`

This is the main pipeline. It streams the ~4GB CSV, aggregates by postcode district and year, then writes the output files.

**Dependencies note:** This script runs with `npx tsx scripts/process-data.ts`.

```bash
npm install -D tsx@^4.19.0
```

```ts
import * as fs from "node:fs";
import * as path from "node:path";
import { createReadStream } from "node:fs";
import csvParser from "csv-parser";

// --- Types for pipeline ---

interface Transaction {
  price: number;
  date: string; // YYYY-MM-DD HH:MM
  postcode: string;
  propertyType: string; // D, S, T, F, O
}

interface DistrictYearAccumulator {
  prices: number[];
  byType: Record<string, number[]>;
}

type AggregatedData = Map<string, Map<number, DistrictYearAccumulator>>;

// --- Config ---

const RAW_DATA_DIR = path.resolve(__dirname, "raw-data");
const CSV_PATH = path.join(RAW_DATA_DIR, "pp-complete.csv");
const POLYGONS_DIR = path.join(RAW_DATA_DIR, "uk-postcode-polygons", "geojson");
const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "data");
const TRENDS_DIR = path.join(OUTPUT_DIR, "trends");

// Land Registry CSV has NO header row. Columns by index:
// 0: Transaction ID
// 1: Price
// 2: Date of Transfer
// 3: Postcode
// 4: Property Type (D/S/T/F/O)
// 5: Old/New (Y/N)
// 6: Duration (F/L = Freehold/Leasehold)
// 7-14: Address fields
// 15: PPD Category Type
// 16: Record Status

const VALID_PROPERTY_TYPES = new Set(["D", "S", "T", "F", "O"]);

// --- Helpers ---

/** Extract postcode district from full postcode, e.g. "SW1A 1AA" -> "SW1A" */
function getPostcodeDistrict(postcode: string): string {
  const trimmed = postcode.trim();
  const parts = trimmed.split(" ");
  if (parts.length >= 2) {
    return parts[0].toUpperCase();
  }
  // Handle postcodes without space (e.g. "SW1A1AA")
  // Outward code is 2-4 chars: letter(s) + digit(s) + optional letter
  const match = trimmed.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/i);
  return match ? match[1].toUpperCase() : trimmed.toUpperCase();
}

/** Extract postcode area from district, e.g. "SW1A" -> "SW", "B1" -> "B" */
function getPostcodeArea(district: string): string {
  const match = district.match(/^([A-Z]{1,2})/i);
  return match ? match[1].toUpperCase() : district;
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// --- Step 1: Stream and aggregate CSV ---

async function aggregateCSV(): Promise<AggregatedData> {
  console.log(`Streaming CSV: ${CSV_PATH}`);
  const data: AggregatedData = new Map();
  let rowCount = 0;
  let skipped = 0;

  return new Promise((resolve, reject) => {
    createReadStream(CSV_PATH)
      .pipe(
        csvParser({
          headers: false, // No header row in Land Registry CSV
          quote: '"',
        })
      )
      .on("data", (row: Record<string, string>) => {
        rowCount++;
        if (rowCount % 1_000_000 === 0) {
          console.log(`  Processed ${(rowCount / 1_000_000).toFixed(0)}M rows...`);
        }

        const price = parseInt(row["1"], 10);
        const dateStr = row["2"];
        const postcode = row["3"];
        const propertyType = row["4"];

        // Skip invalid rows
        if (!postcode || !dateStr || isNaN(price) || price < 100) {
          skipped++;
          return;
        }

        const year = parseInt(dateStr.substring(0, 4), 10);
        if (isNaN(year) || year < 1995) {
          skipped++;
          return;
        }

        const pType = VALID_PROPERTY_TYPES.has(propertyType) ? propertyType : "O";
        const district = getPostcodeDistrict(postcode);

        if (!data.has(district)) {
          data.set(district, new Map());
        }
        const districtMap = data.get(district)!;

        if (!districtMap.has(year)) {
          districtMap.set(year, { prices: [], byType: {} });
        }
        const acc = districtMap.get(year)!;
        acc.prices.push(price);

        if (!acc.byType[pType]) {
          acc.byType[pType] = [];
        }
        acc.byType[pType].push(price);
      })
      .on("end", () => {
        console.log(`CSV complete: ${rowCount} rows, ${skipped} skipped, ${data.size} districts`);
        resolve(data);
      })
      .on("error", reject);
  });
}

// --- Step 2: Compute statistics ---

interface ComputedYearStats {
  year: number;
  avgPrice: number;
  medianPrice: number;
  transactionCount: number;
  yoyChange: number | null;
  byType: Record<string, { avgPrice: number; count: number }>;
}

interface ComputedDistrict {
  code: string;
  years: ComputedYearStats[];
}

function computeStats(data: AggregatedData): Map<string, ComputedDistrict> {
  console.log("Computing statistics...");
  const results = new Map<string, ComputedDistrict>();

  for (const [district, yearMap] of data) {
    const sortedYears = [...yearMap.keys()].sort((a, b) => a - b);
    const yearStats: ComputedYearStats[] = [];

    for (const year of sortedYears) {
      const acc = yearMap.get(year)!;
      const sorted = acc.prices.slice().sort((a, b) => a - b);
      const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
      const med = Math.round(median(sorted));

      const byType: Record<string, { avgPrice: number; count: number }> = {};
      for (const [pType, prices] of Object.entries(acc.byType)) {
        const typeAvg = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
        byType[pType] = { avgPrice: typeAvg, count: prices.length };
      }

      // YoY change
      let yoyChange: number | null = null;
      if (yearStats.length > 0) {
        const prevAvg = yearStats[yearStats.length - 1].avgPrice;
        if (prevAvg > 0) {
          yoyChange = parseFloat((((avg - prevAvg) / prevAvg) * 100).toFixed(1));
        }
      }

      yearStats.push({
        year,
        avgPrice: avg,
        medianPrice: med,
        transactionCount: sorted.length,
        yoyChange,
        byType,
      });
    }

    results.set(district, { code: district, years: yearStats });
  }

  console.log(`Computed stats for ${results.size} districts`);
  return results;
}

// --- Step 3: Load postcode polygons ---

function loadPolygons(): Map<string, GeoJSON.Feature> {
  console.log(`Loading postcode polygons from: ${POLYGONS_DIR}`);
  const polygons = new Map<string, GeoJSON.Feature>();

  const files = fs.readdirSync(POLYGONS_DIR).filter((f) => f.endsWith(".geojson"));
  console.log(`  Found ${files.length} GeoJSON files`);

  for (const file of files) {
    const filePath = path.join(POLYGONS_DIR, file);
    const geojson = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
      for (const feature of geojson.features) {
        // The feature name/id should be the postcode district code
        const name: string =
          feature.properties?.name ||
          feature.properties?.Name ||
          feature.properties?.CODE ||
          "";
        if (name) {
          polygons.set(name.toUpperCase().replace(/\s/g, ""), feature);
        }
      }
    }
  }

  console.log(`  Loaded ${polygons.size} district polygons`);
  return polygons;
}

// --- Step 4: Write output files ---

function writeOutputs(
  stats: Map<string, ComputedDistrict>,
  polygons: Map<string, GeoJSON.Feature>
): void {
  fs.mkdirSync(TRENDS_DIR, { recursive: true });

  // Build summary GeoJSON
  const features: GeoJSON.Feature[] = [];
  let matched = 0;
  let unmatched = 0;

  for (const [code, district] of stats) {
    const polygon = polygons.get(code);

    // Write per-district trend file regardless of polygon match
    const trendPath = path.join(TRENDS_DIR, `${code}.json`);
    fs.writeFileSync(
      trendPath,
      JSON.stringify({ code, name: code, years: district.years })
    );

    if (!polygon) {
      unmatched++;
      continue;
    }
    matched++;

    // Use the latest year with data for summary properties
    const latest = district.years[district.years.length - 1];
    const prevYear =
      district.years.length >= 2
        ? district.years[district.years.length - 2]
        : null;

    const yoyChange = prevYear
      ? parseFloat(
          (
            ((latest.avgPrice - prevYear.avgPrice) / prevYear.avgPrice) *
            100
          ).toFixed(1)
        )
      : 0;

    const byType: Record<string, { avgPrice: number; count: number }> = {};
    for (const pType of ["D", "S", "T", "F", "O"]) {
      byType[pType] = latest.byType[pType] || { avgPrice: 0, count: 0 };
    }

    features.push({
      type: "Feature",
      geometry: polygon.geometry,
      properties: {
        code,
        name: code,
        avgPrice: latest.avgPrice,
        medianPrice: latest.medianPrice,
        transactionCount: latest.transactionCount,
        yoyChange,
        latestYear: latest.year,
        byType,
      },
    });
  }

  const summaryGeoJSON = {
    type: "FeatureCollection" as const,
    features,
  };

  const summaryPath = path.join(OUTPUT_DIR, "districts-summary.geojson");
  fs.writeFileSync(summaryPath, JSON.stringify(summaryGeoJSON));

  const summarySize = (fs.statSync(summaryPath).size / 1024).toFixed(0);
  console.log(`\nOutput written:`);
  console.log(`  Summary GeoJSON: ${summaryPath} (${summarySize}KB, ${features.length} features)`);
  console.log(`  Trend files: ${TRENDS_DIR}/ (${stats.size} files)`);
  console.log(`  Matched polygons: ${matched}, Unmatched: ${unmatched}`);
}

// --- Main ---

async function main() {
  console.log("=== UK House Price Data Pipeline ===\n");

  const data = await aggregateCSV();
  const stats = computeStats(data);
  const polygons = loadPolygons();
  writeOutputs(stats, polygons);

  console.log("\n=== Pipeline complete ===");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
```

### Task 3.3 - Add pipeline npm scripts

**File modified:** `package.json` -- add to `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "data:download": "bash scripts/download-data.sh",
    "data:process": "npx tsx scripts/process-data.ts"
  }
}
```

### Task 3.4 - Run the pipeline

```bash
npm run data:download   # Downloads ~4.3GB CSV + polygon repo
npm run data:process    # Streams CSV, aggregates, writes output
```

**Verification:**
1. `public/data/districts-summary.geojson` exists and is valid JSON (~500KB-2MB)
2. `public/data/trends/` contains ~2,800 JSON files
3. Spot-check a trend file: `cat public/data/trends/SW1.json | head -50`
4. Spot-check the summary: features array is non-empty with valid `avgPrice` values

### Task 3.5 - Add raw data to .gitignore

**File created:** `.gitignore`

Append these lines (in addition to Vite defaults):

```gitignore
# Raw data (too large for git)
scripts/raw-data/

# Processed data (regenerable)
public/data/
```

---

## Phase 4: Map Components

**Dependencies:** Phase 1 complete, Phase 2 complete, Phase 3 complete (need data files)

### Task 4.1 - Create MapView component

**File created:** `src/components/Map/MapView.tsx`

```tsx
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { ChoroplethLayer } from "./ChoroplethLayer";
import { Legend } from "./Legend";
import type { DistrictSummaryGeoJSON } from "../../types";

interface MapViewProps {
  data: DistrictSummaryGeoJSON | null;
}

const UK_CENTER: [number, number] = [53.5, -2.5];
const UK_ZOOM = 6;

export function MapView({ data }: MapViewProps) {
  return (
    <MapContainer
      center={UK_CENTER}
      zoom={UK_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      minZoom={5}
      maxZoom={14}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      {data && <ChoroplethLayer data={data} />}
      <Legend />
    </MapContainer>
  );
}
```

### Task 4.2 - Create ChoroplethLayer component

**File created:** `src/components/Map/ChoroplethLayer.tsx`

```tsx
import { useCallback } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import { useAppState } from "../../context/AppContext";
import { getDistrictColor } from "../../utils/colors";
import { formatPrice, formatPercentage } from "../../utils/formatters";
import type { DistrictProperties, DistrictSummaryGeoJSON } from "../../types";

interface ChoroplethLayerProps {
  data: DistrictSummaryGeoJSON;
}

export function ChoroplethLayer({ data }: ChoroplethLayerProps) {
  const { state, dispatch } = useAppState();
  const map = useMap();

  const style = useCallback(
    (feature: Feature | undefined): PathOptions => {
      if (!feature?.properties) {
        return { fillColor: "#ccc", weight: 1, color: "#999", fillOpacity: 0.7 };
      }
      const props = feature.properties as DistrictProperties;
      return {
        fillColor: getDistrictColor(props, state.colorMode),
        weight: 1,
        color: "#666",
        fillOpacity: 0.7,
      };
    },
    [state.colorMode]
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as DistrictProperties;

      // Tooltip on hover
      layer.bindTooltip(
        `<strong>${props.code}</strong><br/>` +
          `Avg: ${formatPrice(props.avgPrice)}<br/>` +
          `YoY: ${formatPercentage(props.yoyChange)}`,
        { sticky: true }
      );

      // Click to select
      layer.on("click", () => {
        dispatch({ type: "SELECT_DISTRICT", district: props.code });
        map.flyTo(
          layer.getBounds?.().getCenter() ?? map.getCenter(),
          10,
          { duration: 0.5 }
        );
      });
    },
    [dispatch, map]
  );

  // React-Leaflet's GeoJSON component uses `key` to force re-render when data/style changes
  return (
    <GeoJSON
      key={`choropleth-${state.colorMode}-${state.propertyTypeFilter}-${state.yearRange.join("-")}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
```

**Note:** The `layer.getBounds?.()` call uses Leaflet's internal method on GeoJSON layers to get the feature bounds. This is available on polygon layers.

### Task 4.3 - Create Legend component

**File created:** `src/components/Map/Legend.tsx`

```tsx
import { useAppState } from "../../context/AppContext";
import { getLegendStops } from "../../utils/colors";
import { formatPriceCompact, formatPercentage } from "../../utils/formatters";

export function Legend() {
  const { state } = useAppState();
  const stops = getLegendStops(state.colorMode);

  const formatLabel = (value: number): string =>
    state.colorMode === "price"
      ? formatPriceCompact(value)
      : formatPercentage(value);

  return (
    <div className="absolute bottom-6 left-6 z-[1000] rounded-lg bg-white p-3 shadow-md">
      <h4 className="mb-2 text-xs font-semibold text-gray-700">
        {state.colorMode === "price" ? "Average Price" : "YoY Change"}
      </h4>
      <div className="flex flex-col gap-1">
        {stops.map(([value, color]) => (
          <div key={value} className="flex items-center gap-2">
            <div
              className="h-4 w-6 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600">{formatLabel(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Task 4.4 - Create Map barrel export

**File created:** `src/components/Map/index.ts`

```ts
export { MapView } from "./MapView";
```

**Verification:** Import `MapView` in `App.tsx` with dummy/null data, confirm the OSM tile layer renders with zoom controls.

---

## Phase 5: Sidebar Components

**Dependencies:** Phase 2 complete (types and formatters)

### Task 5.1 - Create Sidebar container

**File created:** `src/components/Sidebar/Sidebar.tsx`

```tsx
import { useAppState } from "../../context/AppContext";
import { useDistrictTrend } from "../../hooks/useDistrictTrend";
import { DistrictSummary } from "./DistrictSummary";
import { TrendChart } from "./TrendChart";
import { PropertyBreakdown } from "./PropertyBreakdown";

export function Sidebar() {
  const { state } = useAppState();
  const { trend, loading } = useDistrictTrend(state.selectedDistrict);

  if (!state.selectedDistrict) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Click a district on the map to see details
        </p>
      </aside>
    );
  }

  if (loading) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading...</p>
      </aside>
    );
  }

  if (!trend) {
    return (
      <aside className="flex h-full w-80 flex-col items-center justify-center border-l border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">No data available for this district</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-80 flex-col gap-4 overflow-y-auto border-l border-gray-200 bg-white p-4">
      <DistrictSummary trend={trend} />
      <TrendChart trend={trend} />
      <PropertyBreakdown trend={trend} />
    </aside>
  );
}
```

### Task 5.2 - Create DistrictSummary component

**File created:** `src/components/Sidebar/DistrictSummary.tsx`

```tsx
import type { DistrictTrend } from "../../types";
import {
  formatPrice,
  formatPercentage,
  formatNumber,
} from "../../utils/formatters";

interface DistrictSummaryProps {
  trend: DistrictTrend;
}

export function DistrictSummary({ trend }: DistrictSummaryProps) {
  const latest = trend.years[trend.years.length - 1];
  if (!latest) return null;

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-gray-900">
        District: {trend.code}
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">Avg Price</dt>
        <dd className="font-semibold text-gray-900">
          {formatPrice(latest.avgPrice)}
        </dd>

        <dt className="text-gray-500">Median Price</dt>
        <dd className="font-semibold text-gray-900">
          {formatPrice(latest.medianPrice)}
        </dd>

        <dt className="text-gray-500">YoY Change</dt>
        <dd
          className={`font-semibold ${
            (latest.yoyChange ?? 0) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {latest.yoyChange !== null ? formatPercentage(latest.yoyChange) : "N/A"}
        </dd>

        <dt className="text-gray-500">Transactions</dt>
        <dd className="font-semibold text-gray-900">
          {formatNumber(latest.transactionCount)}
        </dd>

        <dt className="text-gray-500">Data Year</dt>
        <dd className="font-semibold text-gray-900">{latest.year}</dd>
      </dl>
    </div>
  );
}
```

### Task 5.3 - Create TrendChart component

**File created:** `src/components/Sidebar/TrendChart.tsx`

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DistrictTrend } from "../../types";
import { formatPrice, formatPriceCompact } from "../../utils/formatters";
import { useAppState } from "../../context/AppContext";

interface TrendChartProps {
  trend: DistrictTrend;
}

export function TrendChart({ trend }: TrendChartProps) {
  const { state } = useAppState();
  const [minYear, maxYear] = state.yearRange;

  const chartData = trend.years
    .filter((y) => y.year >= minYear && y.year <= maxYear)
    .map((y) => ({
      year: y.year,
      avgPrice: y.avgPrice,
      medianPrice: y.medianPrice,
    }));

  if (chartData.length === 0) {
    return <p className="text-xs text-gray-400">No data in selected range</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">Price Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={formatPriceCompact}
            width={55}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => formatPrice(value)}
            labelFormatter={(label: number) => `Year: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="avgPrice"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Average"
          />
          <Line
            type="monotone"
            dataKey="medianPrice"
            stroke="#9333ea"
            strokeWidth={2}
            dot={false}
            name="Median"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Task 5.4 - Create PropertyBreakdown component

**File created:** `src/components/Sidebar/PropertyBreakdown.tsx`

```tsx
import type { DistrictTrend, PropertyType } from "../../types";
import { PROPERTY_TYPE_LABELS } from "../../types";
import { formatPrice, formatNumber } from "../../utils/formatters";

interface PropertyBreakdownProps {
  trend: DistrictTrend;
}

const TYPE_ORDER: PropertyType[] = ["D", "S", "T", "F", "O"];

export function PropertyBreakdown({ trend }: PropertyBreakdownProps) {
  const latest = trend.years[trend.years.length - 1];
  if (!latest) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        By Property Type ({latest.year})
      </h3>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="pb-1">Type</th>
            <th className="pb-1 text-right">Avg Price</th>
            <th className="pb-1 text-right">Count</th>
          </tr>
        </thead>
        <tbody>
          {TYPE_ORDER.map((pType) => {
            const data = latest.byType[pType];
            if (!data || data.count === 0) return null;
            return (
              <tr key={pType} className="border-b border-gray-100">
                <td className="py-1 text-gray-700">
                  {PROPERTY_TYPE_LABELS[pType]}
                </td>
                <td className="py-1 text-right font-medium text-gray-900">
                  {formatPrice(data.avgPrice)}
                </td>
                <td className="py-1 text-right text-gray-600">
                  {formatNumber(data.count)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### Task 5.5 - Create Sidebar barrel export

**File created:** `src/components/Sidebar/index.ts`

```ts
export { Sidebar } from "./Sidebar";
```

**Verification:** Render `Sidebar` in isolation with mock trend data to confirm summary, chart, and table render correctly.

---

## Phase 6: Controls

**Dependencies:** Phase 2 complete (types)

### Task 6.1 - Create SearchBar component

**File created:** `src/components/Controls/SearchBar.tsx`

```tsx
import { useState, useCallback } from "react";
import { useMap } from "react-leaflet";
import { useAppState } from "../../context/AppContext";

interface SearchBarProps {
  /** All district codes for autocomplete matching */
  districtCodes: string[];
}

export function SearchBar({ districtCodes }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { dispatch } = useAppState();
  const map = useMap();

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      const upper = value.toUpperCase().trim();
      if (upper.length === 0) {
        setSuggestions([]);
        return;
      }
      const matches = districtCodes
        .filter((code) => code.startsWith(upper))
        .slice(0, 8);
      setSuggestions(matches);
    },
    [districtCodes]
  );

  const selectDistrict = useCallback(
    (code: string) => {
      setQuery(code);
      setSuggestions([]);
      dispatch({ type: "SELECT_DISTRICT", district: code });
      // The map will fly to the district via ChoroplethLayer click handler
      // For search, we rely on the GeoJSON layer to handle the fly-to
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const upper = query.toUpperCase().trim();
      if (districtCodes.includes(upper)) {
        selectDistrict(upper);
      }
    },
    [query, districtCodes, selectDistrict]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search postcode district..."
        className="w-48 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {suggestions.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => selectDistrict(code)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50"
              >
                {code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

**Note:** The `SearchBar` must be rendered inside a `MapContainer` context because it uses `useMap()`. It will be placed inside the map container as a custom control overlay.

### Task 6.2 - Create FilterBar component

**File created:** `src/components/Controls/FilterBar.tsx`

```tsx
import { useAppState } from "../../context/AppContext";
import { PROPERTY_TYPE_LABELS } from "../../types";
import type { PropertyType } from "../../types";

const FILTER_OPTIONS: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
    value: value as PropertyType,
    label,
  })),
];

export function FilterBar() {
  const { state, dispatch } = useAppState();

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 bg-white px-4 py-2">
      {/* Property type filter */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>Filter:</span>
        <select
          value={state.propertyTypeFilter}
          onChange={(e) =>
            dispatch({
              type: "SET_PROPERTY_TYPE_FILTER",
              propertyType: e.target.value as PropertyType | "all",
            })
          }
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Year range */}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>From:</span>
        <input
          type="range"
          min={1995}
          max={2025}
          value={state.yearRange[0]}
          onChange={(e) =>
            dispatch({
              type: "SET_YEAR_RANGE",
              range: [parseInt(e.target.value, 10), state.yearRange[1]],
            })
          }
          className="w-24"
        />
        <span className="w-10 text-xs font-medium">{state.yearRange[0]}</span>
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span>To:</span>
        <input
          type="range"
          min={1995}
          max={2025}
          value={state.yearRange[1]}
          onChange={(e) =>
            dispatch({
              type: "SET_YEAR_RANGE",
              range: [state.yearRange[0], parseInt(e.target.value, 10)],
            })
          }
          className="w-24"
        />
        <span className="w-10 text-xs font-medium">{state.yearRange[1]}</span>
      </label>
    </div>
  );
}
```

### Task 6.3 - Create ColorModeToggle component

**File created:** `src/components/Controls/ColorModeToggle.tsx`

```tsx
import { useAppState } from "../../context/AppContext";
import type { ColorMode } from "../../types";

export function ColorModeToggle() {
  const { state, dispatch } = useAppState();

  const toggle = (mode: ColorMode) => {
    dispatch({ type: "SET_COLOR_MODE", mode });
  };

  return (
    <div className="flex rounded-md border border-gray-300 bg-white text-sm shadow-sm">
      <button
        type="button"
        onClick={() => toggle("price")}
        className={`px-3 py-1.5 ${
          state.colorMode === "price"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
        } rounded-l-md`}
      >
        Price
      </button>
      <button
        type="button"
        onClick={() => toggle("growth")}
        className={`px-3 py-1.5 ${
          state.colorMode === "growth"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
        } rounded-r-md`}
      >
        Growth
      </button>
    </div>
  );
}
```

### Task 6.4 - Create Controls barrel export

**File created:** `src/components/Controls/index.ts`

```ts
export { SearchBar } from "./SearchBar";
export { FilterBar } from "./FilterBar";
export { ColorModeToggle } from "./ColorModeToggle";
```

**Verification:** Each control renders independently with no console errors.

---

## Phase 7: App Layout, State Management, and Data Flow

**Dependencies:** All previous phases complete

### Task 7.1 - Create AppContext with useReducer

**File created:** `src/context/AppContext.tsx`

```tsx
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { AppState, AppAction } from "../types";

const initialState: AppState = {
  selectedDistrict: null,
  colorMode: "price",
  propertyTypeFilter: "all",
  yearRange: [2015, 2025],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SELECT_DISTRICT":
      return { ...state, selectedDistrict: action.district };
    case "SET_COLOR_MODE":
      return { ...state, colorMode: action.mode };
    case "SET_PROPERTY_TYPE_FILTER":
      return { ...state, propertyTypeFilter: action.propertyType };
    case "SET_YEAR_RANGE":
      return { ...state, yearRange: action.range };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext value={{ state, dispatch }}>
      {children}
    </AppContext>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return ctx;
}
```

### Task 7.2 - Create useDistrictData hook

**File created:** `src/hooks/useDistrictData.ts`

```ts
import { useState, useEffect } from "react";
import type { DistrictSummaryGeoJSON } from "../types";

export function useDistrictData() {
  const [data, setData] = useState<DistrictSummaryGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/data/districts-summary.geojson");
        if (!response.ok) {
          throw new Error(`Failed to load district data: ${response.status}`);
        }
        const geojson: DistrictSummaryGeoJSON = await response.json();
        if (!cancelled) {
          setData(geojson);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
```

### Task 7.3 - Create useDistrictTrend hook

**File created:** `src/hooks/useDistrictTrend.ts`

```ts
import { useState, useEffect, useRef } from "react";
import type { DistrictTrend } from "../types";

/** Simple in-memory cache for fetched trend data */
const trendCache = new Map<string, DistrictTrend>();

export function useDistrictTrend(districtCode: string | null) {
  const [trend, setTrend] = useState<DistrictTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!districtCode) {
      setTrend(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = trendCache.get(districtCode);
    if (cached) {
      setTrend(cached);
      setLoading(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`/data/trends/${districtCode}.json`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: DistrictTrend) => {
        trendCache.set(districtCode, data);
        setTrend(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [districtCode]);

  return { trend, loading, error };
}
```

### Task 7.4 - Wire up App.tsx

**File modified:** `src/App.tsx`

```tsx
import { AppProvider } from "./context/AppContext";
import { MapView } from "./components/Map";
import { Sidebar } from "./components/Sidebar";
import { FilterBar } from "./components/Controls";
import { useDistrictData } from "./hooks/useDistrictData";
import { MapHeader } from "./components/MapHeader";

function AppContent() {
  const { data, loading, error } = useDistrictData();

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">Error loading data: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading district data...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <MapHeader data={data} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <MapView data={data} />
        </div>
        <Sidebar />
      </div>
      <FilterBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

### Task 7.5 - Create MapHeader component

This component sits above the map and contains the title, search bar, and color toggle. The SearchBar needs `useMap()` context, so we place it inside the MapContainer. Instead, the header search will dispatch to the context, and the map will react.

**File created:** `src/components/MapHeader.tsx`

```tsx
import { useAppState } from "../context/AppContext";
import { ColorModeToggle } from "./Controls";
import { useState, useCallback, useMemo } from "react";
import type { DistrictSummaryGeoJSON } from "../types";

interface MapHeaderProps {
  data: DistrictSummaryGeoJSON | null;
}

export function MapHeader({ data }: MapHeaderProps) {
  const { dispatch } = useAppState();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const districtCodes = useMemo(() => {
    if (!data) return [];
    return data.features.map((f) => f.properties.code).sort();
  }, [data]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      const upper = value.toUpperCase().trim();
      if (upper.length === 0) {
        setSuggestions([]);
        return;
      }
      setSuggestions(
        districtCodes.filter((c) => c.startsWith(upper)).slice(0, 8)
      );
    },
    [districtCodes]
  );

  const selectDistrict = useCallback(
    (code: string) => {
      setQuery(code);
      setSuggestions([]);
      dispatch({ type: "SELECT_DISTRICT", district: code });
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const upper = query.toUpperCase().trim();
      if (districtCodes.includes(upper)) {
        selectDistrict(upper);
      }
    },
    [query, districtCodes, selectDistrict]
  );

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">UK House Price Map</h1>
      <div className="flex items-center gap-4">
        <ColorModeToggle />
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search postcode district..."
            className="w-52 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {suggestions.length > 0 && (
            <ul className="absolute right-0 z-50 mt-1 max-h-48 w-52 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {suggestions.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => selectDistrict(code)}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50"
                  >
                    {code}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </header>
  );
}
```

### Task 7.6 - Fix Leaflet default marker icons

Leaflet's default marker icons break with bundlers. Since we only use polygons (no markers), this is optional, but add the fix to prevent errors if markers are ever used.

**File modified:** `src/main.tsx` -- add after the leaflet CSS import:

```tsx
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
```

**Verification:** `npm run dev` shows the full layout: header with search + toggle, map on left, sidebar placeholder on right, filter bar at bottom.

---

## Phase 8: Integration and Testing

### Task 8.1 - Create sample data for development

Generate small sample data files so the app can be tested without running the full pipeline on 4GB of data.

**File created:** `scripts/generate-sample-data.ts`

This script creates a tiny `districts-summary.geojson` with a handful of districts and corresponding trend files, using fabricated but realistic numbers.

```ts
import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "data");
const TRENDS_DIR = path.join(OUTPUT_DIR, "trends");

fs.mkdirSync(TRENDS_DIR, { recursive: true });

// Sample districts with approximate polygon centroids
const SAMPLE_DISTRICTS = [
  { code: "SW1", lat: 51.498, lng: -0.135, basePrice: 850000, growth: 3.2 },
  { code: "E1", lat: 51.517, lng: -0.057, basePrice: 520000, growth: 4.5 },
  { code: "M1", lat: 53.478, lng: -2.242, basePrice: 210000, growth: 6.1 },
  { code: "B1", lat: 52.480, lng: -1.895, basePrice: 195000, growth: 5.3 },
  { code: "LS1", lat: 53.798, lng: -1.545, basePrice: 180000, growth: 4.8 },
  { code: "CF1", lat: 51.481, lng: -3.179, basePrice: 220000, growth: 3.9 },
  { code: "BS1", lat: 51.454, lng: -2.599, basePrice: 310000, growth: 5.1 },
  { code: "EH1", lat: 55.949, lng: -3.189, basePrice: 280000, growth: 2.8 },
];

function makeCirclePolygon(lat: number, lng: number, radius = 0.03): number[][] {
  const points: number[][] = [];
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * 2 * Math.PI;
    points.push([lng + radius * Math.cos(angle), lat + radius * 0.7 * Math.sin(angle)]);
  }
  return points;
}

const features = SAMPLE_DISTRICTS.map((d) => ({
  type: "Feature" as const,
  geometry: {
    type: "Polygon" as const,
    coordinates: [makeCirclePolygon(d.lat, d.lng)],
  },
  properties: {
    code: d.code,
    name: d.code,
    avgPrice: d.basePrice,
    medianPrice: Math.round(d.basePrice * 0.92),
    transactionCount: Math.floor(Math.random() * 500) + 100,
    yoyChange: d.growth,
    latestYear: 2025,
    byType: {
      D: { avgPrice: Math.round(d.basePrice * 1.6), count: 50 },
      S: { avgPrice: Math.round(d.basePrice * 1.1), count: 80 },
      T: { avgPrice: Math.round(d.basePrice * 0.85), count: 100 },
      F: { avgPrice: Math.round(d.basePrice * 0.65), count: 120 },
      O: { avgPrice: Math.round(d.basePrice * 0.9), count: 10 },
    },
  },
}));

// Write summary GeoJSON
fs.writeFileSync(
  path.join(OUTPUT_DIR, "districts-summary.geojson"),
  JSON.stringify({ type: "FeatureCollection", features }, null, 2)
);

// Write trend files
for (const d of SAMPLE_DISTRICTS) {
  const years = [];
  for (let year = 2000; year <= 2025; year++) {
    const factor = 1 + ((year - 2000) * d.growth) / 100;
    const avgPrice = Math.round(d.basePrice * factor * (0.3 + 0.7 * ((year - 1995) / 30)));
    years.push({
      year,
      avgPrice,
      medianPrice: Math.round(avgPrice * 0.92),
      transactionCount: Math.floor(Math.random() * 500) + 50,
      yoyChange: year === 2000 ? null : parseFloat((d.growth + (Math.random() * 4 - 2)).toFixed(1)),
      byType: {
        D: { avgPrice: Math.round(avgPrice * 1.6), count: Math.floor(Math.random() * 60) },
        S: { avgPrice: Math.round(avgPrice * 1.1), count: Math.floor(Math.random() * 80) },
        T: { avgPrice: Math.round(avgPrice * 0.85), count: Math.floor(Math.random() * 100) },
        F: { avgPrice: Math.round(avgPrice * 0.65), count: Math.floor(Math.random() * 120) },
        O: { avgPrice: Math.round(avgPrice * 0.9), count: Math.floor(Math.random() * 10) },
      },
    });
  }
  fs.writeFileSync(
    path.join(TRENDS_DIR, `${d.code}.json`),
    JSON.stringify({ code: d.code, name: d.code, years })
  );
}

console.log(`Sample data written to ${OUTPUT_DIR}`);
console.log(`  districts-summary.geojson: ${features.length} features`);
console.log(`  trends/: ${SAMPLE_DISTRICTS.length} files`);
```

Add npm script:

```json
"data:sample": "npx tsx scripts/generate-sample-data.ts"
```

### Task 8.2 - End-to-end verification checklist

After all components are wired up, verify each acceptance criterion:

| # | Criterion | How to verify |
|---|-----------|---------------|
| 1 | Map loads showing districts color-coded by average price | Run `npm run data:sample && npm run dev`, map shows colored polygons |
| 2 | Clicking a district shows sidebar with price stats + trend chart | Click a sample district, sidebar populates with data |
| 3 | Postcode search flies the map to the correct area | Type "SW1" in search, district is selected |
| 4 | Property type filter updates choropleth colors | Select "Detached" in filter dropdown (requires filter logic in ChoroplethLayer) |
| 5 | Year range slider adjusts displayed data | Move slider, chart range updates |
| 6 | Color mode toggle switches between price level and YoY growth | Click Growth toggle, colors change |
| 7 | Responsive layout works on desktop and tablet | Resize browser to tablet width |
| 8 | All data is pre-processed, no backend server required | `npm run build && npm run preview` works |

### Task 8.3 - Build and production test

```bash
npm run build     # TypeScript compile + Vite production build
npm run preview   # Serve the production build locally
```

**Verification:**
1. No TypeScript errors during build
2. No console errors in browser
3. Map loads and is interactive
4. Sidebar shows data when a district is clicked
5. All controls function correctly

### Task 8.4 - Property type filter integration

The ChoroplethLayer needs to filter data based on the selected property type. Update the `style` callback in `ChoroplethLayer.tsx` to use the property type filter:

```tsx
// Inside ChoroplethLayer component, update the style callback:
const style = useCallback(
  (feature: Feature | undefined): PathOptions => {
    if (!feature?.properties) {
      return { fillColor: "#ccc", weight: 1, color: "#999", fillOpacity: 0.7 };
    }
    const props = feature.properties as DistrictProperties;
    let displayPrice = props.avgPrice;

    // If filtering by property type, use that type's average price
    if (state.propertyTypeFilter !== "all") {
      const typeData = props.byType[state.propertyTypeFilter];
      displayPrice = typeData?.avgPrice ?? props.avgPrice;
    }

    const colorProps = { ...props, avgPrice: displayPrice };
    return {
      fillColor: getDistrictColor(colorProps, state.colorMode),
      weight: 1,
      color: "#666",
      fillOpacity: 0.7,
    };
  },
  [state.colorMode, state.propertyTypeFilter]
);
```

---

## File Summary

### Files to create (in order)

| Phase | File | Purpose |
|-------|------|---------|
| 1 | `vite.config.ts` | Vite config with React + Tailwind plugins |
| 1 | `src/main.tsx` | Entry point with Leaflet CSS + icon fix |
| 1 | `src/index.css` | Tailwind v4 import |
| 1 | `.gitignore` | Ignore raw data + processed data |
| 2 | `src/types/index.ts` | All TypeScript interfaces and types |
| 2 | `src/utils/colors.ts` | Price-to-color mapping for choropleth |
| 2 | `src/utils/formatters.ts` | Currency, percentage, number formatters |
| 3 | `scripts/download-data.sh` | Download Land Registry CSV + postcode polygons |
| 3 | `scripts/process-data.ts` | Main data pipeline: CSV -> aggregated JSON |
| 3 | `scripts/generate-sample-data.ts` | Generate small sample data for dev |
| 4 | `src/components/Map/MapView.tsx` | Leaflet map container with tile layer |
| 4 | `src/components/Map/ChoroplethLayer.tsx` | GeoJSON choropleth with click/hover |
| 4 | `src/components/Map/Legend.tsx` | Color scale legend overlay |
| 4 | `src/components/Map/index.ts` | Barrel export |
| 5 | `src/components/Sidebar/Sidebar.tsx` | Sidebar container with loading states |
| 5 | `src/components/Sidebar/DistrictSummary.tsx` | Price stats for selected district |
| 5 | `src/components/Sidebar/TrendChart.tsx` | Recharts line chart for price trends |
| 5 | `src/components/Sidebar/PropertyBreakdown.tsx` | Table of prices by property type |
| 5 | `src/components/Sidebar/index.ts` | Barrel export |
| 6 | `src/components/Controls/SearchBar.tsx` | Postcode district search with autocomplete |
| 6 | `src/components/Controls/FilterBar.tsx` | Property type + year range controls |
| 6 | `src/components/Controls/ColorModeToggle.tsx` | Price vs Growth toggle |
| 6 | `src/components/Controls/index.ts` | Barrel export |
| 7 | `src/context/AppContext.tsx` | React Context + useReducer state management |
| 7 | `src/hooks/useDistrictData.ts` | Fetch + cache summary GeoJSON |
| 7 | `src/hooks/useDistrictTrend.ts` | Fetch + cache per-district trend |
| 7 | `src/components/MapHeader.tsx` | Header with title, search, toggle |
| 7 | `src/App.tsx` | Root layout wiring everything together |

### NPM packages

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.0 | UI framework |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `leaflet` | ^1.9.4 | Map engine |
| `react-leaflet` | ^5.0.0 | React bindings for Leaflet |
| `recharts` | ^3.7.0 | Chart library |
| `tailwindcss` | ^4.1.0 | CSS framework |
| `@tailwindcss/vite` | ^4.1.0 | Tailwind Vite plugin |
| `@types/react` | ^19.0.0 | React type definitions (dev) |
| `@types/react-dom` | ^19.0.0 | ReactDOM type definitions (dev) |
| `@types/leaflet` | ^1.9.0 | Leaflet type definitions (dev) |
| `typescript` | ^5.7.0 | TypeScript compiler (dev) |
| `vite` | ^6.2.0 | Build tool (dev) |
| `@vitejs/plugin-react` | ^4.4.0 | Vite React plugin (dev) |
| `csv-parser` | ^3.2.0 | Streaming CSV parser (dev) |
| `@types/csv-parser` | ^1.0.0 | csv-parser types (dev) |
| `tsx` | ^4.19.0 | TypeScript execution for scripts (dev) |

### Data URLs

| Resource | URL |
|----------|-----|
| Land Registry PPD (complete CSV, ~4.3GB) | `http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv` |
| Land Registry PPD info page | `https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads` |
| UK Postcode District Polygons (GeoJSON) | `https://github.com/missinglink/uk-postcode-polygons` |
| OpenStreetMap tiles | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

---

## Task Dependency Graph

```
Phase 1 (Scaffolding)
  |
  +-- Phase 2 (Types & Utils)
  |     |
  |     +-- Phase 4 (Map Components)
  |     |     |
  |     +-- Phase 5 (Sidebar Components)
  |     |     |
  |     +-- Phase 6 (Controls)
  |           |
  +-- Phase 3 (Data Pipeline) -- runs independently
  |           |
  |           v
  +----> Phase 7 (App Layout, State, Data Flow)
              |
              v
         Phase 8 (Integration & Testing)
```

**Parallelizable work:** Phases 3, 4, 5, and 6 can all be built in parallel after Phase 2 is complete. Phase 7 depends on 4-6 for components and on 3 for data files (or use sample data from Task 8.1). Phase 8 requires everything.
