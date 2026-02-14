# UK House Price Map - Design

## Overview

An interactive choropleth map for property investors showing house price trends across England & Wales. Uses free, open data from HM Land Registry (24M+ transactions) displayed on OpenStreetMap tiles.

## Target User

Property investors and analysts who want to:
- Identify undervalued areas and growth trends
- Compare price levels across postcode districts
- Track year-over-year price changes
- Analyse price breakdown by property type

## Architecture

```
┌─────────────────────────────────────────────┐
│  Data Pipeline (runs locally, one-time)     │
│  Land Registry CSV → aggregate by postcode  │
│  district → GeoJSON files with stats        │
└──────────────────┬──────────────────────────┘
                   │ static files
┌──────────────────▼──────────────────────────┐
│  Static Hosting (Vercel / GitHub Pages)     │
│  /data/districts-summary.geojson            │
│  /data/trends/{district}.json               │
└──────────────────┬──────────────────────────┘
                   │ fetch on demand
┌──────────────────▼──────────────────────────┐
│  React + TypeScript SPA                     │
│  Leaflet map + choropleth layer             │
│  Sidebar with trend charts                  │
└─────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Mapping:** Leaflet + React-Leaflet (free OSM tiles)
- **Charts:** Recharts (price trend lines)
- **Styling:** Tailwind CSS
- **Data Pipeline:** Node.js scripts

## Data Pipeline

### Input: Land Registry Price Paid Data
- Bulk CSV download from gov.uk (~4GB)
- Fields: price, date, postcode, property type, new build, tenure
- Coverage: England & Wales, 1995-present

### Processing
1. Download Land Registry bulk CSV
2. Parse and group by postcode district (~2,800 districts)
3. For each district, calculate per year:
   - Average and median price
   - Transaction count
   - Year-over-year % change
   - Breakdown by property type (Detached/Semi/Terraced/Flat)
4. Join with ONS postcode district boundary GeoJSON

### Output Files
- `districts-summary.geojson` - All districts with latest stats (~500KB)
- `trends/{district-code}.json` - Yearly detail per district (~2KB each)

## User Interface

```
┌──────────────────────────────────────────────────────────────────┐
│  UK House Price Map                          [Search postcode]   │
├────────────────────────────────────────────┬─────────────────────┤
│                                            │  District: SW1      │
│          Choropleth Map                    │  Avg Price: £850K   │
│    (color-coded postcode districts)        │  Trend: +3.2% YoY   │
│                                            │                     │
│    Green=Low  Yellow=Mid  Red=High         │  [Price Trend Chart] │
│                                            │                     │
│    Click a district to see details →       │  By Property Type:  │
│                                            │  Detached: £1.2M    │
│                                            │  Semi: £720K        │
│                                            │  Terraced: £580K    │
│                                            │  Flat: £450K        │
│                                            │                     │
│                                            │  Transactions: 342  │
├────────────────────────────────────────────┴─────────────────────┤
│  Filter: [All Types]  Year Range: [2015]──●──[2025]             │
└──────────────────────────────────────────────────────────────────┘
```

### Key Interactions
- **Map:** Pan/zoom across England & Wales. Districts shaded by average price
- **Click district:** Sidebar shows stats + trend chart
- **Search:** Type postcode to fly to area
- **Filters:** Property type dropdown, year range slider
- **Color mode toggle:** Average price vs YoY % change

## Components

```
src/
  App.tsx                    # Layout: map + sidebar
  components/
    Map/
      MapView.tsx            # Leaflet map with choropleth layer
      ChoroplethLayer.tsx    # GeoJSON layer with color styling
      Legend.tsx             # Color scale legend
    Sidebar/
      Sidebar.tsx            # Container for district details
      DistrictSummary.tsx    # Price stats for selected district
      TrendChart.tsx         # Recharts line chart
      PropertyBreakdown.tsx  # Prices by property type
    Controls/
      SearchBar.tsx          # Postcode search
      FilterBar.tsx          # Property type + year range
      ColorModeToggle.tsx    # Toggle price vs growth view
  hooks/
    useDistrictData.ts       # Load & cache summary GeoJSON
    useDistrictTrend.ts      # Fetch per-district trend
  types/
    index.ts                 # TypeScript interfaces
  utils/
    colors.ts                # Price-to-color mapping
    formatters.ts            # Currency & percentage formatting
```

## Data Flow

1. App loads `districts-summary.geojson` on mount → renders choropleth
2. User clicks district → fetches `trends/{code}.json` → sidebar shows detail
3. Filter changes → re-color choropleth with filtered data
4. Search → map flies to postcode location

## State Management

React Context + `useReducer`. State shape:
- `selectedDistrict: string | null`
- `colorMode: 'price' | 'growth'`
- `propertyTypeFilter: PropertyType | 'all'`
- `yearRange: [number, number]`

## Data Sources

| Source | URL | Purpose |
|--------|-----|---------|
| Land Registry Price Paid | gov.uk/price-paid-data | Transaction prices |
| ONS Postcode Boundaries | geoportal.statistics.gov.uk | District polygons |
| OpenStreetMap | tile.openstreetmap.org | Base map tiles |

## Acceptance Criteria

1. Map loads showing all ~2,800 postcode districts color-coded by average price
2. Clicking a district shows sidebar with price stats and trend chart
3. Postcode search flies the map to the correct area
4. Property type filter updates the choropleth colors
5. Year range slider adjusts which data is displayed
6. Color mode toggle switches between price level and YoY growth
7. Responsive layout works on desktop and tablet
8. All data is pre-processed - no backend server required
