/**
 * Acre&Key Map — Export Unit Pricing & Configuration Dataset to CSV for Google Sheets
 * 
 * Generates data/projects_unit_pricing.csv containing all 306 inventory unit rows across 102 projects
 * ready for import into the Google Sheet tab.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const INPUT_FILE = path.join(DATA_DIR, 'map_data.json');
const OUTPUT_CSV = path.join(DATA_DIR, 'projects_unit_pricing.csv');

const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

let csvRows = ['Project ID,Project Name,Locality,BHK Type,Super Builtup Area (sqft),Price Per Sqft (₹),All Inclusive Price'];

data.projects.forEach(p => {
  if (Array.isArray(p.inventory)) {
    p.inventory.forEach(inv => {
      csvRows.push(`"${p.id}","${p.title.replace(/"/g, '""')}","${p.locality}","${inv.bhkType}",${inv.superBuiltupAreaSqft},${inv.pricePerSqft},"${inv.allInclusivePriceStr}"`);
    });
  }
});

fs.writeFileSync(OUTPUT_CSV, csvRows.join('\n'), 'utf8');
console.log(`✅ Successfully generated ${csvRows.length - 1} inventory rows in ${OUTPUT_CSV}`);
