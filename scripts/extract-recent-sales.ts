import * as fs from "node:fs";
import * as path from "node:path";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import csvParser from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, "raw-data", "pp-complete.csv");
const OUTPUT_DIR = path.resolve(__dirname, "..", "public", "data", "sales");

// Only keep transactions from the last 2 years
const MIN_YEAR = 2023;
const MAX_PER_DISTRICT = 300;

const VALID_PROPERTY_TYPES = new Set(["D", "S", "T", "F", "O"]);

interface Sale {
  price: number;
  date: string;
  postcode: string;
  type: string;
  address: string;
}

function getPostcodeDistrict(postcode: string): string {
  const trimmed = postcode.trim();
  const parts = trimmed.split(" ");
  if (parts.length >= 2) return parts[0].toUpperCase();
  const match = trimmed.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/i);
  return match ? match[1].toUpperCase() : trimmed.toUpperCase();
}

async function main() {
  console.log("=== Extract Recent Sales ===\n");
  console.log(`Reading: ${CSV_PATH}`);
  console.log(`Min year: ${MIN_YEAR}, Max per district: ${MAX_PER_DISTRICT}\n`);

  const districts = new Map<string, Sale[]>();
  let rowCount = 0;
  let kept = 0;

  await new Promise<void>((resolve, reject) => {
    createReadStream(CSV_PATH)
      .pipe(csvParser({ headers: false, quote: '"' }))
      .on("data", (row: Record<string, string>) => {
        rowCount++;
        if (rowCount % 2_000_000 === 0) {
          console.log(`  ${(rowCount / 1_000_000).toFixed(0)}M rows... (${kept} kept)`);
        }

        const dateStr = row["2"];
        if (!dateStr) return;

        const year = parseInt(dateStr.substring(0, 4), 10);
        if (isNaN(year) || year < MIN_YEAR) return;

        const price = parseInt(row["1"], 10);
        const postcode = row["3"];
        const propertyType = row["4"];

        if (!postcode || isNaN(price) || price < 100) return;

        const pType = VALID_PROPERTY_TYPES.has(propertyType) ? propertyType : "O";
        const district = getPostcodeDistrict(postcode);

        // Build a short address from available fields
        const parts = [row["7"], row["9"], row["11"]].filter(Boolean);
        const address = parts.join(", ") || postcode;

        if (!districts.has(district)) {
          districts.set(district, []);
        }
        districts.get(district)!.push({
          price,
          date: dateStr.substring(0, 10),
          postcode: postcode.trim(),
          type: pType,
          address,
        });
        kept++;
      })
      .on("end", () => resolve())
      .on("error", reject);
  });

  console.log(`\nCSV done: ${rowCount} rows, ${kept} recent sales, ${districts.size} districts`);

  // Sort by date descending and cap per district
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  let totalWritten = 0;

  for (const [code, sales] of districts) {
    sales.sort((a, b) => b.date.localeCompare(a.date));
    const capped = sales.slice(0, MAX_PER_DISTRICT);
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${code}.json`),
      JSON.stringify(capped)
    );
    totalWritten += capped.length;
  }

  console.log(`\nWritten ${districts.size} district files to ${OUTPUT_DIR}`);
  console.log(`Total sales written: ${totalWritten}`);
  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
