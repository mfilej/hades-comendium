// find-missing-images.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Open the database
const db = new DB("boons.db");

// Create a function to extract image from HTML
function extractImageData(
  html: string,
): {
  hasImg: boolean;
  hasValidSrc: boolean;
  src: string | null;
  dataSrc: string | null;
  alt: string | null;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");

  if (!doc) {
    return {
      hasImg: false,
      hasValidSrc: false,
      src: null,
      dataSrc: null,
      alt: null,
    };
  }

  const img = doc.querySelector("img");

  if (!img) {
    return {
      hasImg: false,
      hasValidSrc: false,
      src: null,
      dataSrc: null,
      alt: null,
    };
  }

  const src = img.getAttribute("src");
  const dataSrc = img.getAttribute("data-src");
  const alt = img.getAttribute("alt");

  const hasValidSrc = !!(src && !src.startsWith("data:"));

  return {
    hasImg: true,
    hasValidSrc,
    src,
    dataSrc,
    alt,
  };
}

// Get all boons
const boons = db.query<
  [number, string, number, string, string, string, string, string, string]
>("SELECT * FROM boons");

// Array to store missing images info
const missingImages: {
  id: number;
  god: string;
  name: string;
  img: ReturnType<typeof extractImageData>;
  iconExists: boolean;
}[] = [];

// Process each boon
for (const boon of boons) {
  const [
    id,
    god,
    rowIdx,
    boonName,
    boonHtml,
    description,
    rarity,
    notes,
    prerequisites,
  ] = boon;

  // Extract image data
  const imgData = extractImageData(boonHtml);

  // Generate expected image path
  const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  const expectedPath = `public/images/icons/${god}_${sanitizedBoonName}_i.100`;
  const expectedPath2 = `public/images/icons/${god}_${sanitizedBoonName}.100`;

  // Check if image exists
  const iconExists = await exists(expectedPath) || await exists(expectedPath2);

  // If no image or no valid source, add to missing list
  if (!iconExists) {
    missingImages.push({
      id,
      god,
      name: boonName,
      img: imgData,
      iconExists,
    });
  }
}

// Print missing images
console.log(`Found ${missingImages.length} boons with missing images:`);
console.log("---------------------------------------------------");

for (const missing of missingImages) {
  console.log(`ID: ${missing.id}, God: ${missing.god}, Boon: ${missing.name}`);

  // Show potential URLs
  if (missing.img.dataSrc) {
    console.log(`  Image data-src: ${missing.img.dataSrc}`);
  } else if (missing.img.src && !missing.img.src.startsWith("data:")) {
    console.log(`  Image src: ${missing.img.src}`);
  } else {
    console.log(`  No valid image source found`);
  }

  console.log("");
}

// Close the database
db.close();
