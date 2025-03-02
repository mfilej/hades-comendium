// scrape-boons.ts
// A script to fetch and save boon tables from the Hades wiki
// Using DOM parser for reliable HTML extraction

// Import the DOM parser
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const gods = [
  "Aphrodite",
  "Ares",
  "Artemis",
  "Athena",
  "Demeter",
  "Dionysus",
  "Hermes",
  "Poseidon",
  "Zeus",
  // Chaos is special but also has boons
  "Chaos",
];

for (const god of gods) {
  const url = `https://hades.fandom.com/wiki/${god}/Boons_(Hades)`;
  console.log(`Fetching boons for ${god} from ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      continue;
    }
    
    const html = await response.text();
    const document = new DOMParser().parseFromString(html, "text/html");
    
    if (!document) {
      console.error(`Could not parse HTML for ${god}`);
      continue;
    }

    // Find boon tables - look for tables with class that contains "boonTable"
    const boonTables = document.querySelectorAll("table.wikitable");
    
    let relevantTable = null;
    
    // Find the table that's most likely the boon list
    for (const table of boonTables) {
      // Check if table has "boonTable" in its class list or has a preceding h2 with "List"
      const classAttr = table.getAttribute("class") || "";
      if (classAttr.includes("boonTable")) {
        relevantTable = table;
        break;
      }
    }
    
    // If we couldn't find it by class, look for a table following a heading with "List"
    if (!relevantTable) {
      const headings = document.querySelectorAll("h2");
      for (const heading of headings) {
        if (heading.textContent?.includes("List")) {
          // Look for the next table after this heading
          let nextElement = heading.nextElementSibling;
          while (nextElement) {
            if (nextElement.tagName === "TABLE") {
              relevantTable = nextElement;
              break;
            }
            nextElement = nextElement.nextElementSibling;
          }
          if (relevantTable) break;
        }
      }
    }
    
    if (relevantTable) {
      // Get the complete HTML of the table
      const tableHtml = relevantTable.outerHTML;
      await Deno.writeTextFile(`boons/${god}.html`, tableHtml);
      console.log(`Saved boon table for ${god}`);
    } else {
      console.error(`Could not find boon table for ${god}`);
      // Save the entire page as fallback
      await Deno.writeTextFile(`boons/${god}-full.html`, html);
      console.log(`Saved full page for ${god} as fallback`);
    }
  } catch (error) {
    console.error(`Error fetching boons for ${god}:`, error);
  }
}

console.log("Finished fetching all boon data");