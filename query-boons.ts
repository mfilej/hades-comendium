// query-boons.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Open the database
const db = new DB("boons.db");

// Helper function to remove HTML tags from text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Get command-line arguments (if any)
const args = Deno.args;
let query = "";

if (args.length > 0) {
  // User provided a search term
  const searchTerm = args[0].toLowerCase();
  query = `
    SELECT 
      id, 
      god, 
      boon_name, 
      description,
      notes,
      prerequisites
    FROM boons 
    WHERE 
      LOWER(boon_name) LIKE '%${searchTerm}%' OR 
      LOWER(description) LIKE '%${searchTerm}%' OR
      LOWER(notes) LIKE '%${searchTerm}%'
    ORDER BY god, boon_name
  `;
} else {
  // No search term - show all boons
  query = `
    SELECT 
      id, 
      god, 
      boon_name, 
      description,
      notes,
      prerequisites
    FROM boons
    ORDER BY god, boon_name
  `;
}

console.log("Querying boons database...\n");

// Run the query
const results = db.query(query);

// Display results in a formatted way
console.log("Results:");
console.log("--------------------------------------");
for (const row of results) {
  const [id, god, boonName, description, notes, prerequisites] = row;
  
  console.log(`[${god.toUpperCase()}] ${boonName}`);
  
  // Remove HTML tags to display description
  const descText = stripHtml(description as string);
  console.log(`Description: ${descText}`);
  
  // Show notes if they exist
  const notesText = stripHtml(notes as string);
  if (notesText && notesText.trim() !== "") {
    console.log(`Notes: ${notesText}`);
  }
  
  // Show prerequisites if they exist and aren't "None"
  const prereqText = stripHtml(prerequisites as string);
  if (prereqText && prereqText.trim() !== "" && prereqText.toLowerCase() !== "none") {
    console.log(`Prerequisites: ${prereqText}`);
  }
  
  console.log("--------------------------------------");
}

console.log(`Found ${results.length} boons`);

// Close the database
db.close();