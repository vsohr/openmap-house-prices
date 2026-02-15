# UK House Price Map

Interactive choropleth map showing house price trends across England & Wales, powered by HM Land Registry Price Paid Data (~24M transactions, 1995-present).

## Features

- Choropleth map colored by year-over-year price growth across ~2,800 postcode districts
- Click any district for detailed stats, trend charts, and property type breakdowns
- Search by postcode or area name
- Filter by property type (Detached, Semi, Terraced, Flat) and year range
- Compare two districts side-by-side
- View recent sales with map markers

## Quick Start

```bash
npm install
npm run data:sample   # Generate sample data for 8 districts
npm run dev           # Start dev server at http://localhost:5173
```

## Full Data Setup

To use real Land Registry data instead of sample data:

1. **Download raw data** (~4.3GB CSV + postcode polygon GeoJSON):
   ```bash
   npm run data:download
   ```
   This downloads `pp-complete.csv` from HM Land Registry and clones UK postcode polygon boundaries into `scripts/raw-data/`.

2. **Process into static files:**
   ```bash
   npm run data:process
   ```
   This streams the CSV, groups by postcode district, and outputs:
   - `public/data/districts-summary.geojson` — all districts with summary stats
   - `public/data/trends/{code}.json` — yearly trend data per district
   - `public/data/sales/{code}.json` — recent sales per district

3. **Run the app:**
   ```bash
   npm run dev
   ```

> Raw data files (`scripts/raw-data/`, `*.csv`, `public/data/`) are gitignored. Each developer needs to run the data pipeline locally.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint on all `.ts`/`.tsx` files |
| `npm run preview` | Preview production build |
| `npm run data:download` | Download Land Registry CSV + polygon data |
| `npm run data:process` | Process raw data into static JSON/GeoJSON |
| `npm run data:sample` | Generate sample data for development |

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Leaflet + react-leaflet for mapping
- Recharts for charts
- Tailwind CSS 4
- Node.js scripts with tsx for data processing

## Data Sources

- [HM Land Registry Price Paid Data](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) — transaction records for England & Wales
- [postcodes.io](https://postcodes.io/) — free UK postcode geocoding API
- [OpenStreetMap](https://www.openstreetmap.org/) — map tiles
