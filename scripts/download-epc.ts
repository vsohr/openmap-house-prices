/**
 * Downloads EPC (Energy Performance Certificate) data from the EPC API
 * and enriches existing sales data with floor area, rooms, and energy rating.
 *
 * Prerequisites:
 *   1. Register at https://epc.opendatacommunities.org/
 *   2. Get your API key from your account page
 *   3. Set environment variables:
 *      export EPC_EMAIL="your@email.com"
 *      export EPC_API_KEY="your-api-key"
 *
 * Usage:
 *   npx tsx scripts/download-epc.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SALES_DIR = path.resolve(__dirname, "..", "public", "data", "sales");
const CACHE_DIR = path.resolve(__dirname, "raw-data", "epc-cache");
const RATE_LIMIT_MS = 250; // 4 requests per second

const EPC_EMAIL = process.env.EPC_EMAIL;
const EPC_API_KEY = process.env.EPC_API_KEY;

if (!EPC_EMAIL || !EPC_API_KEY) {
  console.error("Missing EPC credentials. Set EPC_EMAIL and EPC_API_KEY environment variables.");
  console.error("Register at https://epc.opendatacommunities.org/ to get your API key.");
  process.exit(1);
}

const AUTH_HEADER = `Basic ${Buffer.from(`${EPC_EMAIL}:${EPC_API_KEY}`).toString("base64")}`;

interface EpcRecord {
  address: string;
  postcode: string;
  floorArea: number;
  rooms: number;
  energyRating: string;
  propertyType: string;
  date: string;
}

interface Sale {
  price: number;
  date: string;
  postcode: string;
  type: string;
  address: string;
  floorArea?: number;
  rooms?: number;
  energyRating?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Query EPC API for all certificates at a given postcode */
async function fetchEpcByPostcode(postcode: string): Promise<EpcRecord[]> {
  const encoded = encodeURIComponent(postcode.trim());
  const url = `https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=${encoded}&size=5000`;

  const res = await fetch(url, {
    headers: {
      Authorization: AUTH_HEADER,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      // Rate limited - wait and retry
      await sleep(2000);
      return fetchEpcByPostcode(postcode);
    }
    return [];
  }

  const json = await res.json();
  const rows = json.rows ?? [];

  return rows.map((row: Record<string, string>) => ({
    address: [row["address1"], row["address2"], row["address3"]]
      .filter(Boolean)
      .join(", ")
      .toUpperCase(),
    postcode: (row["postcode"] ?? "").trim().toUpperCase(),
    floorArea: parseFloat(row["total-floor-area"]) || 0,
    rooms: parseInt(row["number-habitable-rooms"], 10) || 0,
    energyRating: row["current-energy-rating"] ?? "",
    propertyType: row["property-type"] ?? "",
    date: row["lodgement-date"] ?? "",
  }));
}

/** Normalize address for matching: strip common noise */
function normalizeAddress(addr: string): string {
  return addr
    .toUpperCase()
    .replace(/[,.\-\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract the house number from an address string */
function extractNumber(addr: string): string | null {
  const match = addr.match(/\b(\d+[A-Z]?)\b/);
  return match ? match[1] : null;
}

/** Match a sale to the best EPC record */
function findBestMatch(sale: Sale, epcRecords: EpcRecord[]): EpcRecord | null {
  // Filter to same postcode
  const samePostcode = epcRecords.filter(
    (e) => e.postcode === sale.postcode.trim().toUpperCase()
  );
  if (samePostcode.length === 0) return null;

  const saleNorm = normalizeAddress(sale.address);
  const saleNum = extractNumber(saleNorm);

  // Try exact number + street match
  for (const epc of samePostcode) {
    const epcNorm = normalizeAddress(epc.address);
    const epcNum = extractNumber(epcNorm);
    if (saleNum && epcNum && saleNum === epcNum) {
      // Check if street name overlaps
      const saleWords = new Set(saleNorm.split(" ").filter((w) => w.length > 2));
      const epcWords = epcNorm.split(" ").filter((w) => w.length > 2);
      const overlap = epcWords.filter((w) => saleWords.has(w)).length;
      if (overlap >= 1) return epc;
    }
  }

  // Fallback: pick the most recent EPC for this postcode
  const sorted = [...samePostcode].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0] ?? null;
}

async function main() {
  console.log("=== EPC Data Enrichment ===\n");

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // Collect all unique postcodes from sales data
  const salesFiles = fs.readdirSync(SALES_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${salesFiles.length} sales district files`);

  const allPostcodes = new Set<string>();
  for (const file of salesFiles) {
    const sales: Sale[] = JSON.parse(
      fs.readFileSync(path.join(SALES_DIR, file), "utf-8")
    );
    for (const sale of sales) {
      allPostcodes.add(sale.postcode.trim().toUpperCase());
    }
  }

  console.log(`Unique postcodes to look up: ${allPostcodes.size}`);

  // Fetch EPC data by postcode (with caching)
  const epcByPostcode = new Map<string, EpcRecord[]>();
  let fetched = 0;
  let cached = 0;

  for (const postcode of allPostcodes) {
    const cacheFile = path.join(CACHE_DIR, `${postcode.replace(/\s/g, "_")}.json`);

    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      epcByPostcode.set(postcode, data);
      cached++;
      continue;
    }

    const records = await fetchEpcByPostcode(postcode);
    epcByPostcode.set(postcode, records);

    // Cache the result
    fs.writeFileSync(cacheFile, JSON.stringify(records));

    fetched++;
    if (fetched % 100 === 0) {
      console.log(`  Fetched ${fetched}/${allPostcodes.size - cached} postcodes...`);
    }

    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\nFetched: ${fetched}, Cached: ${cached}`);

  // Enrich sales files
  let enriched = 0;
  let unmatched = 0;

  for (const file of salesFiles) {
    const filePath = path.join(SALES_DIR, file);
    const sales: Sale[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const sale of sales) {
      const postcode = sale.postcode.trim().toUpperCase();
      const records = epcByPostcode.get(postcode) ?? [];
      const match = findBestMatch(sale, records);

      if (match && match.floorArea > 0) {
        sale.floorArea = match.floorArea;
        sale.rooms = match.rooms;
        sale.energyRating = match.energyRating;
        enriched++;
      } else {
        unmatched++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(sales));
  }

  console.log(`\nEnriched: ${enriched}, Unmatched: ${unmatched}`);
  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
