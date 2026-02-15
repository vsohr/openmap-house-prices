import * as fs from "node:fs";
import * as path from "node:path";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import csvParser from "csv-parser";

// --- ESM __dirname polyfill ---

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
