// combine-boons.ts
// Combines all boon tables from the boons directory into a single HTML table
// Adding the God's name as the first column

// Import the DOM parser from the same library used in scrape-boons.ts
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

async function main() {
  try {
    // Get all HTML files in the boons directory except Ares-full.html
    const entries = Array.from(Deno.readDirSync("boons/"));
    const htmlFiles = entries
      .filter(entry => entry.isFile && 
               entry.name.endsWith(".html") && 
               entry.name !== "Ares-full.html")
      .map(entry => entry.name);

    console.log(`Found ${htmlFiles.length} boon files to process`);

    // Create the combined table structure
    const combinedTableHtml = `
<table>
  <thead>
    <tr>
      <th>God</th>
      <th>Boon</th>
      <th>Description</th>
      <th>Type</th>
      <th>Rarity</th>
      <th>Requires</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>`;

    // Parse the combined table HTML
    const parser = new DOMParser();
    const combinedDocument = parser.parseFromString(combinedTableHtml, "text/html");
    if (!combinedDocument) {
      throw new Error("Failed to create combined document structure");
    }

    const combinedTbody = combinedDocument.querySelector("tbody");
    if (!combinedTbody) {
      throw new Error("Could not find tbody in combined document");
    }

    // Process each boon file
    for (const file of htmlFiles) {
      // Extract god name from filename (removing .html extension)
      const godName = file.replace(".html", "");
      console.log(`Processing ${godName}...`);

      // Read the boon file
      const boonHtml = await Deno.readTextFile(`boons/${file}`);
      const boonDocument = parser.parseFromString(boonHtml, "text/html");
      
      if (!boonDocument) {
        console.error(`Could not parse HTML for ${godName}`);
        continue;
      }

      // Get all rows except the header row
      const rows = boonDocument.querySelectorAll("tr");
      
      // Skip the first row (header) and process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const newRow = combinedDocument.createElement("tr");
        
        // Add the god name as the first column
        const godCell = combinedDocument.createElement("td");
        godCell.textContent = godName;
        newRow.appendChild(godCell);
        
        // Get the cells from the original row
        const cells = row.querySelectorAll("td");
        
        // Add Boon name (1st column in original)
        if (cells[0]) {
          newRow.appendChild(cells[0].cloneNode(true));
        } else {
          const emptyCell = combinedDocument.createElement("td");
          newRow.appendChild(emptyCell);
        }
        
        // Add Description (2nd column in original)
        const descriptionCell = combinedDocument.createElement("td");
        if (cells[1]) {
          // Only take the basic description text, not any HTML tables inside
          descriptionCell.textContent = cells[1].textContent?.split("\n")[0] || "";
        }
        newRow.appendChild(descriptionCell);
        
        // Extract Type from Notes column (4th column in original)
        const typeCell = combinedDocument.createElement("td");
        if (cells[3]) {
          const notesText = cells[3].textContent || "";
          
          // Check for Tier information in the Notes
          const tierMatch = notesText.match(/Tier (\d+)/);
          if (tierMatch) {
            typeCell.textContent = `Tier ${tierMatch[1]}`;
          }
          
          // Check for special types in the Rarity column (3rd column)
          if (cells[2] && cells[2].textContent) {
            const rarityText = cells[2].textContent;
            if (rarityText.includes("Legendary")) {
              typeCell.textContent = "Legendary";
            } else if (rarityText.includes("Duo")) {
              typeCell.textContent = "Duo";
            }
          }
        }
        newRow.appendChild(typeCell);
        
        // Add Rarity (3rd column in original)
        if (cells[2]) {
          newRow.appendChild(cells[2].cloneNode(true));
        } else {
          const emptyCell = combinedDocument.createElement("td");
          newRow.appendChild(emptyCell);
        }
        
        // Add Prerequisites (5th column in original)
        if (cells[4]) {
          newRow.appendChild(cells[4].cloneNode(true));
        } else {
          const emptyCell = combinedDocument.createElement("td");
          newRow.appendChild(emptyCell);
        }
        
        combinedTbody.appendChild(newRow);
      }
    }

    // Save the combined HTML
    const outputHtml = combinedDocument.querySelector("table")?.outerHTML || "";
    await Deno.writeTextFile("combined-boons.html", outputHtml);
    console.log("Created combined-boons.html successfully!");

  } catch (error) {
    console.error("Error combining boons:", error);
  }
}

await main();