/**
 * Acre&Key Map — Google Apps Script to Add `pitchText` and `tradeoffs` Columns
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit).
 * 2. Click Extensions → Apps Script.
 * 3. Delete any code in the editor, paste this script, and click Save (💾).
 * 4. Select 'addPitchAndTradeoffsColumns' from the dropdown and click Run (▶).
 * 5. This will automatically add 'pitchText' and 'tradeoffs' column headers to your sheet!
 */

function addPitchAndTradeoffsColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet(); // or ss.getSheetByName('Projects')
  var data = sheet.getDataRange().getValues();
  if (data.length < 1) return;

  var headers = data[0];
  var pitchIdx = headers.indexOf('pitchText');
  var tradeoffsIdx = headers.indexOf('tradeoffs');

  // Add pitchText column header if not present
  if (pitchIdx === -1) {
    pitchIdx = headers.length;
    sheet.getRange(1, pitchIdx + 1).setValue('pitchText').setFontWeight('bold').setBackground('#E2E8F0');
  }

  // Add tradeoffs column header if not present
  if (tradeoffsIdx === -1) {
    tradeoffsIdx = sheet.getDataRange().getValues()[0].length;
    sheet.getRange(1, tradeoffsIdx + 1).setValue('tradeoffs').setFontWeight('bold').setBackground('#E2E8F0');
  }

  SpreadsheetApp.getUi().alert('✅ Success! pitchText (Why We Recommend) and tradeoffs (Decision Trade-offs) columns added to your Sheet!');
}
