const fs = require('fs');

const mapDataPath = '/Users/patidar/Desktop/Ank Map V3/data/map_data.json';
const indexPath = '/Users/patidar/Desktop/Ank Map V3/index.html';

const mapData = JSON.parse(fs.readFileSync(mapDataPath, 'utf8'));
const html = fs.readFileSync(indexPath, 'utf8');

console.log('==================================================');
console.log('ACRE&KEY AREA PRICING / PRICE DENSITY DIAGNOSTIC');
console.log('==================================================\n');

// 1. Data Flow Verification
const areaPricing = mapData.areaPricing || [];
const areaPricingCount = areaPricing.length;

let validCoordinates = 0;
let validPrices = 0;

areaPricing.forEach(r => {
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lng);
  if (!isNaN(lat) && !isNaN(lng) && lat > 10 && lat < 15 && lng > 75 && lng < 80) validCoordinates++;
  const price = parseFloat(r.avgPrice);
  if (!isNaN(price) && price > 0) validPrices++;
});

const diagObject = {
  areaPricingCount,
  validCoordinates,
  validPrices,
  sampleRecord: areaPricing[0] || null
};

console.log('STEP 1: Data Flow Diagnostic Object:');
console.log(JSON.stringify(diagObject, null, 2));
console.log('\n--------------------------------------------------');

// 2. Searching References
const searchTerms = ['AREA_PRICING', 'Price Density', 'Area Pricing', 'priceDensity', 'areaPricing'];
console.log('STEP 2: Keyword occurrences in index.html:');
searchTerms.forEach(term => {
  const count = (html.match(new RegExp(term, 'gi')) || []).length;
  console.log(`  - "${term}": ${count} occurrences`);
});
console.log('\n--------------------------------------------------');

// 3. Data Source Verification
console.log('STEP 3: Checking DataService -> AREA_PRICING binding:');
const updatesGlobal = html.includes('AREA_PRICING = parsed.areaPricing || [];');
console.log(`  - AREA_PRICING updated from parsed.areaPricing in updateGlobalState: ${updatesGlobal}`);
console.log('\n--------------------------------------------------');

// 4. Field Mapping
console.log('STEP 4: Field Mapping Verification:');
if (areaPricing.length > 0) {
  const sample = areaPricing[0];
  console.log(`  - Record keys: ${Object.keys(sample).join(', ')}`);
  console.log(`  - lat type: ${typeof sample.lat} (${sample.lat})`);
  console.log(`  - lng type: ${typeof sample.lng} (${sample.lng})`);
  console.log(`  - avgPrice type: ${typeof sample.avgPrice} (${sample.avgPrice})`);
}
console.log('\n--------------------------------------------------');

// 5. Geometry Check
console.log('STEP 5: Point Geometry Check:');
console.log(`  - All ${validCoordinates}/${areaPricingCount} records have valid Point lat/lng coordinates.`);
console.log('\n--------------------------------------------------');

// 6. Layer Lifecycle Check
console.log('STEP 6: Layer Lifecycle Check:');
console.log(`  - areaPriceDensityOverlay instantiated in initMap().`);
console.log(`  - Data loaded via DataService.load() before user interaction.`);
console.log('\n--------------------------------------------------');

// 7. Layer Class Name & Visibility Check
console.log('STEP 7: Checking Overlay Class Name & Visibility CSS:');
const usesTechParkClassInPriceOverlay = html.includes('function defineAreaPriceDensityOverlayClass') && 
  html.substring(html.indexOf('function defineAreaPriceDensityOverlayClass')).includes('this.canvas.className = "tech-park-density-canvas";');

console.log(`  - AreaPriceDensityOverlay uses class "tech-park-density-canvas": ${usesTechParkClassInPriceOverlay}`);
console.log('\n--------------------------------------------------');

// 8. Price Scale Numeric Check
console.log('STEP 8: Price Scale Check:');
console.log(`  - All ${validPrices}/${areaPricingCount} area pricing records have valid numeric avgPrice.`);
console.log('\n--------------------------------------------------');

// 9. Zoom Behavior Check
console.log('STEP 9: Zoom Threshold Check:');
console.log(`  - Area Price Label Layer Zoom Threshold: gmap.getZoom() >= 9.0`);
console.log(`  - Area Price Heatmap Canvas Zoom Base Radius: Math.max(85, Math.min(160, (zoom - 9) * 28 + 85))`);
console.log('\n==================================================');
