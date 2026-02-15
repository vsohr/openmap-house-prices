# Progress

## Current Phase: MVP Complete

## Completed
- [x] Research data sources (Land Registry, OSM, Zoopla, Rightmove, EPC)
- [x] Brainstorming session - refined idea into design
- [x] Design document: docs/plans/2026-02-14-house-price-map-design.md
- [x] Implementation plan: docs/plans/2026-02-14-house-price-map-implementation.md
- [x] Project scaffolding (Vite + React 19 + TypeScript + Tailwind CSS 4)
- [x] Data pipeline scripts (download, process, sample data generator)
- [x] Map components (MapView, ChoroplethLayer, Legend)
- [x] Sidebar components (DistrictSummary, TrendChart, PropertyBreakdown)
- [x] Controls (FilterBar, ColorModeToggle, MapHeader with search)
- [x] State management (AppContext + useReducer)
- [x] Data hooks (useDistrictData, useDistrictTrend)
- [x] Integration and build passing

## Key Decisions
- **Data source:** HM Land Registry Price Paid Data (free, 24M+ records)
- **Architecture:** Pre-processed static files, no backend server
- **Frontend:** React 19 + TypeScript + Vite
- **Mapping:** Leaflet + React-Leaflet with choropleth
- **Charts:** Recharts for price trends
- **Styling:** Tailwind CSS 4
- **Visualization:** Choropleth by postcode district (~2,800 districts)
- **Target user:** Property investors/analysts
- **Geographic scope:** England & Wales (full)

## To Use Real Data
1. Run `npm run data:download` (downloads ~4.3GB Land Registry CSV + postcode polygons)
2. Run `npm run data:process` (processes CSV into static GeoJSON/JSON files)
3. Run `npm run dev` to view with real data

## For Development (sample data)
1. Run `npm run data:sample` (generates 8 sample districts)
2. Run `npm run dev` to view at http://localhost:5173
