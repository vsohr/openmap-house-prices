import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// --- ESM __dirname polyfill ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Write regional days-to-sell data
const regionalDaysToSell = {
  ukAverage: 40,
  lastUpdated: "2026-01",
  regions: [
    { region: "North East", avgDaysToSell: 35, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "North West", avgDaysToSell: 33, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "Yorkshire & The Humber", avgDaysToSell: 37, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "East Midlands", avgDaysToSell: 40, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "West Midlands", avgDaysToSell: 42, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "East of England", avgDaysToSell: 45, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "London", avgDaysToSell: 48, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "South East", avgDaysToSell: 50, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "South West", avgDaysToSell: 46, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "Wales", avgDaysToSell: 57, dataMonth: "2026-01", source: "Zoopla HPI" },
    { region: "Scotland", avgDaysToSell: 21, dataMonth: "2026-01", source: "Zoopla HPI" },
  ],
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, "regional-days-to-sell.json"),
  JSON.stringify(regionalDaysToSell, null, 2)
);

console.log(`Sample data written to ${OUTPUT_DIR}`);
console.log(`  districts-summary.geojson: ${features.length} features`);
console.log(`  trends/: ${SAMPLE_DISTRICTS.length} files`);
console.log(`  regional-days-to-sell.json: ${regionalDaysToSell.regions.length} regions`);
