// download-missing-flares.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

// Create the database connection
const db = new DB("boons.db");

// Ensure the images directory exists
await ensureDir("public/images/icons");

// Function to download an image and save it locally
async function downloadAndSaveImage(imageUrl, alt, god, boonName) {
  try {
    // Clean the image URL if needed (some URLs have parameters we need to remove)
    const cleanUrl = imageUrl.split('?')[0];
    
    // Generate a filename based on the god and boon name
    const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const urlParts = cleanUrl.split('/');
    const originalFilename = urlParts[urlParts.length - 1];
    
    // Create a sanitized filename
    const filename = `${god}_${sanitizedBoonName}_i.${originalFilename.split('.').pop()}`;
    
    const localPath = `images/icons/${filename}`;
    const fullPath = `public/${localPath}`;
    
    // Fetch the image
    console.log(`Downloading ${imageUrl} for ${god}'s ${boonName}...`);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    const imageData = new Uint8Array(await response.arrayBuffer());
    
    // Save the image to the local filesystem
    await Deno.writeFile(fullPath, imageData);
    console.log(`Saved image to ${fullPath}`);
    
    // Add to our database
    db.query(
      "INSERT INTO icons (original_url, local_path, alt_text) VALUES (?, ?, ?)",
      [imageUrl, localPath, alt]
    );
    
    // Update the boon_html to use the new image
    const boon = db.query("SELECT boon_html FROM boons WHERE god = ? AND boon_name = ?", [god, boonName]);
    if (boon.length > 0) {
      const boonHtml = boon[0][0];
      
      // Parse the HTML and update the image
      const updatedHtml = boonHtml.replace(/<img[^>]*>/g, `<img src="/${localPath}" alt="${alt || boonName}">`);
      
      // Update the database
      db.query(
        "UPDATE boons SET boon_html = ? WHERE god = ? AND boon_name = ?",
        [updatedHtml, god, boonName]
      );
    }
    
    return localPath;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return null;
  }
}

// List of missing flare boons with their source shot boon image URLs
const flareData = [
  {
    god: "artemis",
    boonName: "Hunter's Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/7/7d/True_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204328",
    alt: "Hunter's Flare I"
  },
  {
    god: "poseidon",
    boonName: "Flood Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/0/0f/Flood_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204327",
    alt: "Flood Flare I"
  },
  {
    god: "zeus",
    boonName: "Thunder Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/8/83/Electric_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204327",
    alt: "Thunder Flare I"
  },
  {
    god: "dionysus",
    boonName: "Trippy Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/7/7d/Trippy_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204328",
    alt: "Trippy Flare I"
  },
  {
    god: "demeter",
    boonName: "Icy Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/c/c1/Crystal_Beam_I.png/revision/latest/scale-to-width-down/100?cb=20240604204327",
    alt: "Icy Flare I"
  },
  {
    god: "aphrodite",
    boonName: "Passion Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/2/2f/Crush_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204327",
    alt: "Passion Flare I"
  },
  {
    god: "ares",
    boonName: "Slicing Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/2/2b/Slicing_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204328",
    alt: "Slicing Flare I"
  },
  {
    god: "athena",
    boonName: "Phalanx Flare",
    sourceUrl: "https://static.wikia.nocookie.net/hades_gamepedia_en/images/a/a8/Phalanx_Shot_I.png/revision/latest/scale-to-width-down/100?cb=20240604204327",
    alt: "Phalanx Flare I"
  }
];

// Download each flare image
let downloadCount = 0;
console.log(`Attempting to download ${flareData.length} missing Flare images...`);

for (const flare of flareData) {
  const result = await downloadAndSaveImage(flare.sourceUrl, flare.alt, flare.god, flare.boonName);
  if (result) {
    downloadCount++;
  }
}

console.log(`\nDownloaded ${downloadCount} out of ${flareData.length} Flare images.`);

// Close the database
db.close();

console.log("\nDone! Database has been updated with missing Flare images.");