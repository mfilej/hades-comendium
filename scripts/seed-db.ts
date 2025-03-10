// create-boons-db.ts
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

// Create the database
const db = new DB("boons.db");

// Drop table if exists to start fresh
db.execute("DROP TABLE IF EXISTS boons");
db.execute("DROP TABLE IF EXISTS icons");

// Create the boons table
db.execute(`
  CREATE TABLE IF NOT EXISTS boons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    god TEXT NOT NULL,
    row_idx INTEGER NOT NULL,
    boon_name TEXT NOT NULL,
    slug TEXT NOT NULL,
    boon_html TEXT,
    description TEXT,
    rarity TEXT,
    notes TEXT,
    prerequisites TEXT
  )
`);

// Create a table to track icons
db.execute(`
  CREATE TABLE IF NOT EXISTS icons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT UNIQUE NOT NULL,
    local_path TEXT NOT NULL,
    alt_text TEXT
  )
`);

// Ensure the images directory exists
await ensureDir("public/images/icons");

// Function to download an image and save it locally
async function downloadAndSaveImage(imageUrl, alt, god) {
  try {
    // Check if we already have this image in our database
    const existingIcon = db.query(
      "SELECT local_path FROM icons WHERE original_url = ?",
      [imageUrl],
    );
    if (existingIcon.length > 0) {
      return existingIcon[0][0]; // Return the local path
    }

    // Clean the image URL if needed (some URLs have parameters we need to remove)
    const cleanUrl = imageUrl.split("?")[0];

    // Generate a filename based on the god and alt text or a random name if not available
    const urlParts = cleanUrl.split("/");
    const originalFilename = urlParts[urlParts.length - 1];

    // Create a sanitized filename
    const sanitizedAlt = alt
      ? alt.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
      : "";
    const filename = sanitizedAlt
      ? `${god}_${sanitizedAlt}.${originalFilename.split(".").pop()}`
      : `${god}_${originalFilename}`;

    const localPath = `images/icons/${filename}`;
    const fullPath = `public/${localPath}`;

    // Fetch the image
    console.log(`Downloading ${imageUrl}...`);
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`,
      );
    }

    const imageData = new Uint8Array(await response.arrayBuffer());

    // Save the image to the local filesystem
    await Deno.writeFile(fullPath, imageData);
    console.log(`Saved image to ${fullPath}`);

    // Add to our database
    db.query(
      "INSERT INTO icons (original_url, local_path, alt_text) VALUES (?, ?, ?)",
      [imageUrl, localPath, alt],
    );

    return localPath;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return null;
  }
}

// Function to process HTML content and replace image URLs
async function processHtmlContent(content, god) {
  // Create a temporary document to parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${content}</div>`, "text/html");

  if (!doc) return content;

  // Process all img tags
  const imgTags = doc.querySelectorAll("img");

  for (const img of Array.from(imgTags)) {
    // Get the image source and alt text
    const alt = img.getAttribute("alt") || "";
    const src = img.getAttribute("src");
    const dataSrc = img.getAttribute("data-src");

    // Prioritize data-src for lazy-loaded images
    let imageUrl = dataSrc || src;

    // Skip if we don't have a usable URL
    if (!imageUrl || imageUrl === "about:blank") continue;

    // Clean up data URIs - if src is a data URI and data-src exists, use data-src
    if (src && src.startsWith("data:") && dataSrc) {
      imageUrl = dataSrc;
    }

    // Download and save the image
    const localPath = await downloadAndSaveImage(imageUrl, alt, god);

    if (localPath) {
      // Create a new image element to replace the old one
      const newImg = doc.createElement("img");
      newImg.setAttribute("src", `/hades-compendium/${localPath}`);
      newImg.setAttribute("alt", alt);

      // Copy other important attributes that aren't data-* attributes
      if (img.hasAttribute("width")) {
        newImg.setAttribute("width", img.getAttribute("width"));
      }
      if (img.hasAttribute("height")) {
        newImg.setAttribute("height", img.getAttribute("height"));
      }

      // Replace the old image with the new one
      img.replaceWith(newImg);
    }
  }

  // Return the processed HTML
  return doc.querySelector("div").innerHTML;
}

// Function to generate a consistent slug for boon names
function generateSlug(boonName: string): string {
  return boonName
    .toLowerCase()
    .replace(/'/g, "") // Remove apostrophes completely
    .replace(/[^a-z0-9]+/g, "_") // Replace any non-alphanumeric characters with underscores
    .replace(/^_+|_+$/g, ""); // Remove leading and trailing underscores
}

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

  // Use Promise.all to process all rows in parallel
  await Promise.all(
    Array.from(rows)
      .slice(1) // Skip header row
      .filter((row) => {
        const firstTd = row.querySelector("td");
        return firstTd && firstTd.className === "boonTableName";
      })
      .map(async (row, i) => {
        const cells = row.querySelectorAll("td");
        const boonName = cells[0].querySelector("b").textContent;

        // Get the original HTML content for each column
        const boonHtml = cells[0].innerHTML.trim();
        const descriptionHtml = cells[1].innerHTML.trim();
        const rarityHtml = cells[2].innerHTML.trim();
        const notesHtml = cells[3].innerHTML.trim();
        const prerequisitesHtml = cells[4].innerHTML.trim();

        try {
          // Process HTML content to replace image URLs with local references
          const processedBoonHtml = await processHtmlContent(boonHtml, god);
          const processedDescription = await processHtmlContent(
            descriptionHtml,
            god,
          );
          const processedRarity = await processHtmlContent(rarityHtml, god);
          const processedNotes = await processHtmlContent(notesHtml, god);
          const processedPrerequisites = await processHtmlContent(
            prerequisitesHtml,
            god,
          );

          // Generate a slug for the boon name
          const slug = generateSlug(boonName);
          
          // Insert into the database with god name, row index, and slug
          db.query(
            "INSERT INTO boons (god, row_idx, boon_name, slug, boon_html, description, rarity, notes, prerequisites) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              god,
              i,
              boonName,
              slug,
              processedBoonHtml,
              processedDescription,
              processedRarity,
              processedNotes,
              processedPrerequisites,
            ],
          );
          boonCount++;
          totalImported++;
        } catch (err) {
          console.error(`Error processing boon ${boonName}: ${err.message}`);
        }
      }),
  );

  console.log(`Imported ${boonCount} boons for ${god}`);
}

// Print stats
const [countRow] = db.query("SELECT COUNT(*) as count FROM boons");
console.log(
  `\nTotal imported: ${
    countRow[0]
  } boons into the database (counted ${totalImported} during import).`,
);

// Count boons by god
console.log("\nBoons by god:");
const godCounts = db.query(
  "SELECT god, COUNT(*) as count FROM boons GROUP BY god ORDER BY COUNT(*) DESC",
);
for (const godCount of godCounts) {
  console.log(`${godCount[0]}: ${godCount[1]}`);
}

// Count icons
const [iconCount] = db.query("SELECT COUNT(*) as count FROM icons");
console.log(`\nTotal icons downloaded: ${iconCount[0]}`);

// Close the database
db.close();

console.log("\nDone! Database created as boons.db");
