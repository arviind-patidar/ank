/**
 * Acre&Key Map — Google Apps Script for Locality Insights Tab Setup
 * 
 * Includes all 15 active map localities pre-populated!
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit).
 * 2. Click Extensions → Apps Script.
 * 3. Paste this script and click Save (💾).
 * 4. Select 'setupLocalityInsightsTab' and click Run (▶).
 * 5. A new tab named 'Locality Insights' will be created with all 15 localities!
 */

function setupLocalityInsightsTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = 'Locality Insights';
  var sheet = ss.getSheetByName(tabName);
  
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  var headers = ['Locality Name', 'Zone', 'Min Price (₹/sqft)', 'Max Price (₹/sqft)', 'Avg Price (₹/sqft)', 'Tagline', 'Employment Pillar', 'Transit Pillar', 'Social Infra Pillar', 'Outlook Pillar'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E2E8F0');

  var sampleRows = [
    ['Bagalur', 'North Bengaluru', 7800, 12500, 9800, 'Bagalur Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '1 active project with strong liquidity'],
    ['Budigere Cross', 'Budigere Cross–OMR East', 9999, 14000, 12000, 'Budigere Cross Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '15 active projects with strong liquidity'],
    ['Chikkajala', 'North Bengaluru', 7500, 12200, 9500, 'Chikkajala Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '1 active project with strong liquidity'],
    ['Devanahalli', 'North Bengaluru', 7500, 12500, 9500, 'Devanahalli Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '19 active projects with strong liquidity'],
    ['Doddaballapur Road', 'North Bengaluru', 8500, 14500, 11500, 'Doddaballapur Road Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '4 active projects with strong liquidity'],
    ['KR Puram', 'KR Puram–Mahadevapura', 9500, 14000, 11500, 'KR Puram Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '12 active projects with strong liquidity'],
    ['Kantanakunte', 'North Bengaluru', 4500, 7800, 5800, 'Kantanakunte Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '1 active project with strong liquidity'],
    ['Mahadevapura', 'KR Puram–Mahadevapura', 11000, 16500, 13500, 'Mahadevapura Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '3 active projects with strong liquidity'],
    ['Panathur', 'Varthur–Gunjur', 11000, 15500, 13000, 'Panathur Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '2 active projects with strong liquidity'],
    ['Rajanukunte', 'North Bengaluru', 6800, 11000, 8500, 'Rajanukunte Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '2 active projects with strong liquidity'],
    ['Shettigere', 'North Bengaluru', 8000, 13000, 10200, 'Shettigere Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '3 active projects with strong liquidity'],
    ['Thanisandra', 'North Bengaluru', 10000, 15800, 12500, 'Thanisandra Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '1 active project with strong liquidity'],
    ['Varthur', 'Core Whitefield–Hoodi', 12500, 16500, 14500, 'Varthur Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '17 active projects with strong liquidity'],
    ['Whitefield', 'Core Whitefield–Hoodi', 14500, 21000, 17750, 'Whitefield Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '20 active projects with strong liquidity'],
    ['Yelahanka', 'North Bengaluru', 9000, 14000, 11000, 'Yelahanka Corridor Hub', 'High tech park & commercial proximity', 'Arterial highway & transit connectivity', 'Established schools & healthcare', '1 active project with strong liquidity']
  ];

  sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
  SpreadsheetApp.getUi().alert('✅ Locality Insights tab for all 15 localities configured successfully!');
}
