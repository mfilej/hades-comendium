// fix-flare-images.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";

// Create the database connection
const db = new DB("boons.db");

// Function to update boon HTML with the downloaded image
async function updateBoonHtml(god, boonName) {
  try {
    // Generate expected image path
    const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const expectedPath = `public/images/icons/${god}_${sanitizedBoonName}_i.100`;
    
    // Check if image exists
    if (await exists(expectedPath)) {
      const localPath = expectedPath.replace('public/', '');
      
      // Update the boon_html to use the new image
      const boon = db.query("SELECT boon_html FROM boons WHERE god = ? AND boon_name = ?", [god, boonName]);
      if (boon.length > 0) {
        const boonHtml = boon[0][0];
        
        // Parse the HTML and update the image
        const updatedHtml = boonHtml.replace(/<img[^>]*>/g, `<img src="/${localPath}" alt="${boonName}">`);
        
        // Update the database
        db.query(
          "UPDATE boons SET boon_html = ? WHERE god = ? AND boon_name = ?",
          [updatedHtml, god, boonName]
        );
        
        console.log(`Updated HTML for ${god}'s ${boonName}`);
        return true;
      }
    } else {
      console.log(`Image not found for ${god}'s ${boonName} at path ${expectedPath}`);
    }
    
    return false;
  } catch (error) {
    console.error(`Error updating boon HTML: ${error.message}`);
    return false;
  }
}

// List of flare boons
const flareData = [
  { god: "artemis", boonName: "Hunter's Flare" },
  { god: "poseidon", boonName: "Flood Flare" },
  { god: "zeus", boonName: "Thunder Flare" },
  { god: "dionysus", boonName: "Trippy Flare" },
  { god: "demeter", boonName: "Icy Flare" },
  { god: "aphrodite", boonName: "Passion Flare" },
  { god: "ares", boonName: "Slicing Flare" },
  { god: "athena", boonName: "Phalanx Flare" }
];

// Update each flare boon
let updateCount = 0;
console.log(`Attempting to update ${flareData.length} Flare boons...`);

for (const flare of flareData) {
  const result = await updateBoonHtml(flare.god, flare.boonName);
  if (result) {
    updateCount++;
  }
}

console.log(`\nUpdated ${updateCount} out of ${flareData.length} Flare boons.`);

// Now let's copy the Shot images to use for corresponding Flare images if needed
async function copyImageForFlare(god, shotName, flareName) {
  try {
    // Generate expected image paths
    const sanitizedShotName = shotName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const sanitizedFlareName = flareName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    const shotPath = `public/images/icons/${god}_${sanitizedShotName}_i.100`;
    const flarePath = `public/images/icons/${god}_${sanitizedFlareName}_i.100`;
    
    // Check if shot image exists and flare doesn't
    if (await exists(shotPath) && !(await exists(flarePath))) {
      // Copy the shot image to the flare path
      const shotData = await Deno.readFile(shotPath);
      await Deno.writeFile(flarePath, shotData);
      
      console.log(`Copied image from ${shotPath} to ${flarePath}`);
      
      // Update the boon HTML
      const localPath = flarePath.replace('public/', '');
      const boon = db.query("SELECT boon_html FROM boons WHERE god = ? AND boon_name = ?", [god, flareName]);
      
      if (boon.length > 0) {
        const boonHtml = boon[0][0];
        const updatedHtml = boonHtml.replace(/<img[^>]*>/g, `<img src="/${localPath}" alt="${flareName}">`);
        
        db.query(
          "UPDATE boons SET boon_html = ? WHERE god = ? AND boon_name = ?",
          [updatedHtml, god, flareName]
        );
        
        console.log(`Updated HTML for ${god}'s ${flareName} using ${shotName} image`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error copying image: ${error.message}`);
    return false;
  }
}

// Mapping of Shot boons to Flare boons
const shotToFlareMap = [
  { god: "artemis", shotName: "True Shot", flareName: "Hunter's Flare" },
  { god: "poseidon", shotName: "Flood Shot", flareName: "Flood Flare" },
  { god: "zeus", shotName: "Electric Shot", flareName: "Thunder Flare" },
  { god: "dionysus", shotName: "Trippy Shot", flareName: "Trippy Flare" },
  { god: "demeter", shotName: "Crystal Beam", flareName: "Icy Flare" },
  { god: "aphrodite", shotName: "Crush Shot", flareName: "Passion Flare" },
  { god: "ares", shotName: "Slicing Shot", flareName: "Slicing Flare" },
  { god: "athena", shotName: "Phalanx Shot", flareName: "Phalanx Flare" }
];

// Copy images if needed
let copyCount = 0;
console.log(`\nAttempting to copy Shot images for any missing Flare images...`);

for (const map of shotToFlareMap) {
  const result = await copyImageForFlare(map.god, map.shotName, map.flareName);
  if (result) {
    copyCount++;
  }
}

console.log(`\nCopied ${copyCount} Shot images to Flare images.`);

// Close the database
db.close();

console.log("\nDone! Database has been updated for Flare boons.");