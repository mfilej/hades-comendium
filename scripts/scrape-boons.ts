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
      console.error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
      );
      continue;
    }

    const html = await response.text();
    const document = new DOMParser().parseFromString(html, "text/html");

    if (!document) {
      console.error(`Could not parse HTML for ${god}`);
      continue;
    }

    const boonTable = document.querySelector("table.boonTableSB");

    if (!boonTable) {
      console.error(`Could not find boon table for ${god}`);
      continue;
    }

    const tableHtml = boonTable.innerHTML;

    await Deno.writeTextFile(`boons/${god}.html`, tableHtml);
    console.log(`Saved boon table for ${god}`);
  } catch (error) {
    console.error(`Error fetching boons for ${god}:`, error);
  }
}

console.log("Finished fetching all boon data");
