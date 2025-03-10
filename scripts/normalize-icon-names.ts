import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { exists } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

console.log("Normalizing icon filenames based on boon slugs...");

// Connect to the database
const db = new DB("boons.db");

// Get all boons with their slugs
const boons = db.queryEntries<{
  id: number;
  god: string;
  boon_name: string;
  slug: string;
}>("SELECT id, god, boon_name, slug FROM boons");

console.log(`Found ${boons.length} boons in the database`);

// Directory containing icon files
const iconsDir = "public/images/icons";

// Check if directory exists
if (!await exists(iconsDir)) {
  console.error(`Directory ${iconsDir} does not exist!`);
  Deno.exit(1);
}

// Get a list of all files in the icons directory
const iconFiles = Array.from(Deno.readDirSync(iconsDir))
  .filter(entry => entry.isFile)
  .map(entry => entry.name);

console.log(`Found ${iconFiles.length} files in ${iconsDir}`);

// Count of renamed files
let renamedCount = 0;
let skippedCount = 0;
let missingCount = 0;

// Track what we've processed
const processed = new Set<string>();

// Process each boon
for (const boon of boons) {
  const god = boon.god.toLowerCase();
  const slug = boon.slug;
  
  // Look for files with various patterns
  const patterns = [
    `${god}_${slug}.100`,
    `${god}_${slug}_i.100`,
    `${god}_${boon.boon_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_i.100`,
    `${god}_${boon.boon_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.100`,
  ];
  
  // For special cases like Aid boons
  if (boon.boon_name.includes("Aid")) {
    patterns.push(`${god}_${god}_s_aid_i.100`);
  }
  
  // Find a matching file
  let foundFile = null;
  for (const pattern of patterns) {
    const matchingFiles = iconFiles.filter(file => 
      file.toLowerCase() === pattern.toLowerCase() || 
      file.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (matchingFiles.length > 0) {
      foundFile = matchingFiles[0];
      break;
    }
  }
  
  // If no file was found, look for any file that starts with the god name and contains any part of the boon name
  if (!foundFile) {
    const partialMatches = iconFiles.filter(file => {
      const lowerFile = file.toLowerCase();
      return lowerFile.startsWith(god) && 
             boon.boon_name.toLowerCase().split(" ").some(word => 
               lowerFile.includes(word.toLowerCase().replace(/[^a-z0-9]/g, ""))
             );
    });
    
    if (partialMatches.length > 0) {
      foundFile = partialMatches[0];
    }
  }
  
  if (foundFile) {
    // Generate the new filename
    const newFilename = `${god}_${slug}_icon.100`;
    const oldPath = join(iconsDir, foundFile);
    const newPath = join(iconsDir, newFilename);
    
    // Check if the new filename already exists
    if (await exists(newPath)) {
      console.log(`File ${newFilename} already exists, skipping...`);
      skippedCount++;
      continue;
    }
    
    try {
      console.log(`Renaming ${foundFile} to ${newFilename}`);
      await Deno.rename(oldPath, newPath);
      renamedCount++;
      processed.add(foundFile);
    } catch (error) {
      console.error(`Error renaming ${foundFile}: ${error.message}`);
      skippedCount++;
    }
  } else {
    console.log(`No matching icon found for ${god} ${boon.boon_name} (slug: ${slug})`);
    missingCount++;
  }
}

// Handle placeholder files - don't rename them
for (const file of iconFiles) {
  if (file.includes("placeholder") && !processed.has(file)) {
    console.log(`Keeping placeholder file: ${file}`);
  }
}

console.log(`\nNormalization complete!`);
console.log(`Renamed: ${renamedCount} files`);
console.log(`Skipped: ${skippedCount} files`);
console.log(`Missing icons: ${missingCount} boons`);

// Close the database
db.close();