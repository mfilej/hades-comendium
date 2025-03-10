// fix-duo-boons.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { copy, exists } from "https://deno.land/std/fs/mod.ts";

// Create the database connection
const db = new DB("boons.db");

// Function to copy duo boon images to their correct location
async function fixDuoBoonImage(boonId, god, boonName, originalGod) {
  try {
    // Generate the path names
    const sanitizedBoonName = boonName.replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();
    const destinationPath =
      `public/images/icons/${god}_${sanitizedBoonName}_i.100`;
    const sourcePath =
      `public/images/icons/${originalGod}_${sanitizedBoonName}_i.100`;

    // If the destination already exists, skip it
    if (await exists(destinationPath)) {
      console.log(`Image already exists at ${destinationPath}, skipping`);
      return false;
    }

    // Check if the source path exists
    if (await exists(sourcePath)) {
      // Copy the file
      const data = await Deno.readFile(sourcePath);
      await Deno.writeFile(destinationPath, data);
      console.log(`Copied image from ${sourcePath} to ${destinationPath}`);

      // Update the HTML in the database
      const localPath = destinationPath.replace("public/", "");
      const [boonHtmlRow] = db.query(
        "SELECT boon_html FROM boons WHERE id = ?",
        [boonId],
      );

      if (boonHtmlRow) {
        const boonHtml = boonHtmlRow[0];
        const updatedHtml = boonHtml.replace(
          /<img[^>]*>/g,
          `<img src="/${localPath}" alt="${boonName}">`,
        );

        db.query("UPDATE boons SET boon_html = ? WHERE id = ?", [
          updatedHtml,
          boonId,
        ]);
        console.log(`Updated HTML for ${god}'s ${boonName}`);
        return true;
      }
    } else {
      console.log(`Source image not found at ${sourcePath}`);
    }

    return false;
  } catch (error) {
    console.error(`Error fixing duo boon: ${error.message}`);
    return false;
  }
}

// Define the list of duo boons
const duoBoons = [
  { id: 22, god: "poseidon", boonName: "Mirage Shot", originalGod: "artemis" },
  { id: 46, god: "zeus", boonName: "Sea Storm", originalGod: "poseidon" },
  { id: 47, god: "zeus", boonName: "Lightning Rod", originalGod: "artemis" },
  {
    id: 68,
    god: "dionysus",
    boonName: "Splitting Headache",
    originalGod: "artemis",
  },
  {
    id: 69,
    god: "dionysus",
    boonName: "Exclusive Access",
    originalGod: "poseidon",
  },
  {
    id: 70,
    god: "dionysus",
    boonName: "Scintillating Feast",
    originalGod: "zeus",
  },
  {
    id: 106,
    god: "demeter",
    boonName: "Crystal Clarity",
    originalGod: "artemis",
  },
  { id: 107, god: "demeter", boonName: "Ice Wine", originalGod: "dionysus" },
  {
    id: 108,
    god: "demeter",
    boonName: "Blizzard Shot",
    originalGod: "poseidon",
  },
  { id: 109, god: "demeter", boonName: "Cold Fusion", originalGod: "zeus" },
  { id: 128, god: "aphrodite", boonName: "Heart Rend", originalGod: "artemis" },
  {
    id: 129,
    god: "aphrodite",
    boonName: "Cold Embrace",
    originalGod: "demeter",
  },
  {
    id: 130,
    god: "aphrodite",
    boonName: "Low Tolerance",
    originalGod: "dionysus",
  },
  {
    id: 131,
    god: "aphrodite",
    boonName: "Sweet Nectar",
    originalGod: "poseidon",
  },
  {
    id: 132,
    god: "aphrodite",
    boonName: "Smoldering Air",
    originalGod: "zeus",
  },
  {
    id: 162,
    god: "ares",
    boonName: "Curse of Longing",
    originalGod: "aphrodite",
  },
  { id: 163, god: "ares", boonName: "Hunting Blades", originalGod: "artemis" },
  { id: 164, god: "ares", boonName: "Freezing Vortex", originalGod: "demeter" },
  {
    id: 165,
    god: "ares",
    boonName: "Curse of Nausea",
    originalGod: "dionysus",
  },
  {
    id: 166,
    god: "ares",
    boonName: "Curse of Drowning",
    originalGod: "poseidon",
  },
  { id: 167, god: "ares", boonName: "Vengeful Mood", originalGod: "zeus" },
  {
    id: 184,
    god: "athena",
    boonName: "Parting Shot",
    originalGod: "aphrodite",
  },
  { id: 185, god: "athena", boonName: "Merciful End", originalGod: "ares" },
  {
    id: 186,
    god: "athena",
    boonName: "Deadly Reversal",
    originalGod: "artemis",
  },
  {
    id: 187,
    god: "athena",
    boonName: "Calculated Risk",
    originalGod: "dionysus",
  },
  {
    id: 188,
    god: "athena",
    boonName: "Unshakable Mettle",
    originalGod: "poseidon",
  },
  {
    id: 189,
    god: "athena",
    boonName: "Lightning Phalanx",
    originalGod: "zeus",
  },
  {
    id: 190,
    god: "athena",
    boonName: "Stubborn Roots",
    originalGod: "demeter",
  },
];

// Process each duo boon
console.log(`Attempting to fix ${duoBoons.length} duo boons...`);
let fixCount = 0;

for (const boon of duoBoons) {
  const result = await fixDuoBoonImage(
    boon.id,
    boon.god,
    boon.boonName,
    boon.originalGod,
  );
  if (result) {
    fixCount++;
  }
}

console.log(`\nFixed ${fixCount} out of ${duoBoons.length} duo boons.`);

// Close the database
db.close();

console.log("\nDone! Database has been updated for duo boons.");
