// create-boons-db.ts
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Create the database
const db = new DB("boons.db");

// Drop table if exists to start fresh
db.execute("DROP TABLE IF EXISTS boons");

// Create the table
db.execute(`
  CREATE TABLE IF NOT EXISTS boons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    god TEXT NOT NULL,
    row_idx INTEGER NOT NULL,
    boon_name TEXT NOT NULL,
    boon_html TEXT,
    description TEXT,
    rarity TEXT,
    notes TEXT,
    prerequisites TEXT
  )
`);

// Process each boon file
const boonFiles = Deno.readDirSync("./boons");
let totalImported = 0;

for (const file of boonFiles) {
  if (!file.name.endsWith(".html")) continue;

  // Extract god name from filename (without .html extension)
  const god = file.name.replace(".html", "").toLowerCase();
  console.log(`\nProcessing ${god}...`);

  // Read the file
  const html = Deno.readTextFileSync(`./boons/${file.name}`);

  // We'll wrap the HTML in a valid HTML structure
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head><title>Boons</title></head>
    <body>
      <table>
        ${html}
      </table>
    </body>
    </html>
  `;

  // Parse with Deno DOM
  const parser = new DOMParser();
  const document = parser.parseFromString(fullHtml, "text/html");

  if (!document) {
    console.error(`Failed to parse HTML for ${file.name}`);
    continue;
  }

  // Method 1: Find rows with class="boonTableName" in the first td
  const rows = document.querySelectorAll("tr");
  console.log(`Found ${rows.length} total rows`);

  let boonCount = 0;

  Array.from(rows)
    .slice(1) // Skip header row
    .filter(row => {
      const firstTd = row.querySelector("td");
      return firstTd && firstTd.className === "boonTableName";
    })
    .forEach((row, i) => {
      const cells = row.querySelectorAll("td");

      const boonName = cells[0].querySelector("b").textContent;

      // Get the full HTML content for each column
      const boonHtml = cells[0].innerHTML.trim();
      const description = cells[1].innerHTML.trim();
      const rarity = cells[2].innerHTML.trim();
      const notes = cells[3].innerHTML.trim();
      const prerequisites = cells[4].innerHTML.trim();

      try {
        // Insert into the database with god name and row index
        db.query(
          "INSERT INTO boons (god, row_idx, boon_name, boon_html, description, rarity, notes, prerequisites) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [god, i, boonName, boonHtml, description, rarity, notes, prerequisites]
        );
        boonCount++;
        totalImported++;
      } catch (err) {
        console.error(`Error inserting boon: ${err.message}`);
      }
    });

  console.log(`Imported ${boonCount} boons for ${god}`);
}

// Print stats
const [countRow] = db.query("SELECT COUNT(*) as count FROM boons");
console.log(`\nTotal imported: ${countRow[0]} boons into the database (counted ${totalImported} during import).`);

// Count boons by god
console.log("\nBoons by god:");
const godCounts = db.query("SELECT god, COUNT(*) as count FROM boons GROUP BY god ORDER BY COUNT(*) DESC");
for (const godCount of godCounts) {
  console.log(`${godCount[0]}: ${godCount[1]}`);
}

// Close the database
db.close();

console.log("\nDone! Database created as boons.db");
