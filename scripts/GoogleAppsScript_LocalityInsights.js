/**
 * Acre&Key Map — Google Apps Script for Locality Insights Tab Setup
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit).
 * 2. Click Extensions → Apps Script.
 * 3. Paste this code and click Save (💾).
 * 4. Select 'setupLocalityInsightsTab' and click Run (▶).
 * 5. A new tab named 'Locality Insights' will be created with all columns pre-populated!
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

  // Sample initial locality data
  var sampleRows = [
    ['Whitefield', 'East Bangalore', 14500, 21000, 17750, 'Core ITPL & EPIP Zone Hub', '57 Tech Parks within 6 km', 'Hope Farm & Purple Line Metro', '11 Top International Schools nearby', 'High Resale Liquidity & Capital Growth'],
    ['Varthur', 'East Bangalore', 10500, 16500, 13500, 'Transforming Lakefront Tech Corridor', 'Sigma Tech Park & ITPL Proximity', 'Varthur-Sarjapur Main Road Transit', 'Greenwood High & Chrysalis High', 'High Appreciation Velocity'],
    ['KR Puram', 'East Bangalore', 8500, 13500, 11000, 'Arterial Interchange Hub', 'KR Puram ORR Tech Corridor', 'Purple & Blue Line Metro Interchange', 'Presidency & Brigade Schools', 'High Rental Yield Zone'],
    ['Budigere Cross', 'East Bangalore', 7500, 11500, 9500, 'Emerging North-East Growth Hub', 'OMR & Airport Corridor Access', '8-Lane Airport Expressway Link', 'National Public School nearby', 'High Future Capital Appreciation'],
    ['Yelahanka', 'North Bangalore', 9000, 14000, 11500, 'North Bengaluru Gateway Hub', 'Manyata & Aerospace Park Proximity', 'Blue Line Airport Metro Line', 'DPS & Ryan International School', 'Strong Infrastructure Growth']
  ];

  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
  }

  SpreadsheetApp.getUi().alert('✅ Locality Insights tab configured successfully!');
}
