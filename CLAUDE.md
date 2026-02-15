# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UK House Price Map — a static React SPA that visualizes HM Land Registry price-paid data (~24M transactions, 1995–present) as a choropleth map across ~2,800 England & Wales postcode districts. No backend server; all data is pre-processed into static JSON/GeoJSON files served from `public/data/`.

## Commands

```bash
npm run dev              # Vite dev server at http://localhost:5173
npm run build            # TypeScript check (tsc -b) + Vite production build
npm run lint             # ESLint on all .ts/.tsx files
npm run preview          # Preview production build locally
npm run data:sample      # Generate 8-district sample data for dev (quick start)
npm run data:download    # Download 4.3GB Land Registry CSV + polygon GeoJSON
npm run data:process     # Process raw CSV → public/data/ artifacts
```

To get started developing: `npm install && npm run data:sample && npm run dev`

## Architecture

### Data Flow
```
Land Registry CSV → Node.js scripts (scripts/) → static GeoJSON/JSON (public/data/) → React SPA fetches on demand → Leaflet choropleth
```

### State Management
React Context with `useReducer` (no Redux). Two split contexts in `src/context/AppContext.tsx`:
- `useAppState()` — reads state (selectedDistrict, propertyTypeFilter, yearRange, flyTo, compare slots)
- `useAppDispatch()` — dispatches typed actions (SELECT_DISTRICT, FLY_TO, SET_PROPERTY_FILTER, etc.)

### Component Layout
```
App → AppProvider → AppContent
  ├─ MapHeader (search via postcodes.io)
  ├─ MapView (Leaflet)
  │   ├─ ChoroplethLayer (GeoJSON styling by YoY growth)
  │   ├─ FlyToDistrict (animation controller)
  │   ├─ RecentSalesLayer (sale markers)
  │   └─ Legend
  ├─ Sidebar (loads trend data on district selection)
  │   ├─ DistrictSummary, TrendChart (Recharts), PropertyBreakdown
  ├─ ComparePanel (side-by-side comparison)
  └─ FilterBar (property type + year range)
```

### Data Hooks
- `useDistrictData()` — loads `districts-summary.geojson` once on mount
- `useDistrictTrend()` — fetches per-district trend JSON with in-memory Map cache
- `useRecentSales()` — fetches sales + geocodes via postcodes.io in 100-postcode batches

All hooks use AbortController for cleanup on unmount/dependency change.

## Tech Stack

- **React 19** + **TypeScript 5.9** (strict mode, no implicit any)
- **Vite 7** with React plugin + Tailwind CSS 4 Vite plugin (no tailwind.config.js)
- **Leaflet 1.9** + **react-leaflet 5** for mapping
- **Recharts 3** for charts
- **Tailwind CSS 4** — imported via `@import "tailwindcss"` in `src/index.css`, all styling is inline className strings
- **ESLint 9** flat config with TypeScript + React Hooks plugins
- **tsx** for running TypeScript data-processing scripts

## Key Conventions

- **Barrel exports** via `index.ts` in component directories
- **Types** in `src/types/` — `PropertyType` is `'D'|'S'|'T'|'F'|'O'` (Detached, Semi, Terraced, Flat, Other)
- **Color mapping** in `src/utils/colors.ts` — `growthToColor()` maps YoY% to blue→red gradient
- **Formatters** in `src/utils/formatters.ts` — `formatCurrency`, `formatPercent`, `formatNumber`
- **Property links** in `src/utils/propertyLinks.ts` — URLs for Rightmove, Zoopla, Google Maps

## External APIs

- **postcodes.io** — free public UK postcode geocoding (batch endpoint, max 100 per request)
- **OpenStreetMap** — map tiles via Leaflet default tile layer

## Data Pipeline (scripts/)

- `download-data.sh` — downloads Land Registry CSV + clones postcode polygon repo
- `process-data.ts` — streams CSV, groups by district, calculates stats, outputs GeoJSON + per-district trend JSONs
- `generate-sample-data.ts` — creates mock data for 8 districts (SW1, E1, M1, B1, LS1, CF1, BS1, EH1)
- Raw data lives in `scripts/raw-data/` (gitignored)

## Git

- **Remote:** `origin` → `https://github.com/vsohr/openmap-house-prices`
- **Main branch:** `main` (target for PRs)
- Generated data files in `public/data/` are gitignored

### Commit & Push
```bash
git add <files>
git commit -m "Description of changes"
git push origin <branch>
```
