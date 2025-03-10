import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

// Connect to the database
const db = new DB("boons.db");

// Query all boons
const boons = db.queryEntries<{
  id: number;
  god: string;
  row_idx: number;
  boon_name: string;
  slug: string;
  boon_html: string;
  description: string;
  rarity: string;
  notes: string;
  prerequisites: string;
}>("SELECT * FROM boons ORDER BY god, row_idx");

// Ensure public/data directory exists
await ensureDir("public/data");

// Write boons to JSON file
await Deno.writeTextFile(
  "public/data/boons.json",
  JSON.stringify(boons, null, 2),
);

console.log(`Exported ${boons.length} boons to public/data/boons.json`);

// Close the database
db.close();
