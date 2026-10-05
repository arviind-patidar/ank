/**
 * Acre&Key Map — Google Apps Script for Google Sheet Auto-Setup
 * 
 * Instructions:
 * 1. In your Google Sheet, click Extensions → Apps Script.
 * 2. Delete any existing code, paste this script, and click Save (💾).
 * 3. Select 'setupAdvisoryColumns' from the dropdown and click Run (▶).
 * 4. This will automatically add 'advisoryPro' and 'advisoryConsideration' headers and populate sample data!
 */

function setupAdvisoryColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  var headers = data[0];
  var proColIdx = headers.indexOf('advisoryPro');
  var conColIdx = headers.indexOf('advisoryConsideration');

  // Add headers if not present
  if (proColIdx === -1) {
    proColIdx = headers.length;
    sheet.getRange(1, proColIdx + 1).setValue('advisoryPro').setFontWeight('bold').setBackground('#E2E8F0');
  }
  if (conColIdx === -1) {
    conColIdx = headers.indexOf('advisoryPro') !== -1 ? headers.length : proColIdx + 1;
    sheet.getRange(1, conColIdx + 1).setValue('advisoryConsideration').setFontWeight('bold').setBackground('#E2E8F0');
  }

  // Populate data rows if blank
  var numRows = data.length - 1;
  for (var i = 1; i <= numRows; i++) {
    var dev = data[i][2] || 'Grade-A Builder';
    var loc = data[i][3] || 'Prime Corridor';
    var zone = data[i][4] || 'Bengaluru Corridor';
    var status = data[i][5] || 'Active';

    var currentPro = sheet.getRange(i + 1, proColIdx + 1).getValue();
    var currentCon = sheet.getRange(i + 1, conColIdx + 1).getValue();

    if (!currentPro) {
      sheet.getRange(i + 1, proColIdx + 1).setValue(dev + ' delivery track record & ' + loc + ' connectivity');
    }
    if (!currentCon) {
      sheet.getRange(i + 1, conColIdx + 1).setValue(status + ' stage in ' + zone + ' corridor');
    }
  }

  SpreadsheetApp.getUi().alert('✅ Advisory columns (advisoryPro & advisoryConsideration) set up successfully!');
}
