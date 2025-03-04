import * as fs from 'node:fs';
import * as path from 'node:path';

// Directory containing the boon HTML files
const boonsDir = path.join(process.cwd(), 'boons');
const outputFile = path.join(process.cwd(), 'combined-boons.html');

// Get all HTML files from the boons directory
const boonFiles = fs.readdirSync(boonsDir)
  .filter(file => file.endsWith('.html'));

// Process each file and combine their contents
const combinedContents = boonFiles.map(file => {
  const content = fs.readFileSync(path.join(boonsDir, file), 'utf-8');

  // Remove leading whitespace and <tbody> tag, and trailing </tbody> and whitespace
  return content
    .replace(/^\s*<tbody>\s*/m, '')  // Remove leading whitespace and tbody
    .replace(/\s*<\/tbody>\s*$/m, '') // Remove trailing tbody and whitespace
    .trim();
}).join('\n');

// Create the final HTML with table wrapper
const finalHtml = `<body>\n<table>\n${combinedContents}\n</table>\n</body>`;

// Write the combined content to the output file
fs.writeFileSync(outputFile, finalHtml, 'utf-8');

console.log(`Successfully combined ${boonFiles.length} boon files into ${outputFile}`);
