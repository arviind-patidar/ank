/**
 * Acre&Key Map — Google Apps Script to Add & Populate `pitchText` and `tradeoffs`
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit).
 * 2. Click Extensions → Apps Script.
 * 3. Delete any code in the editor, paste this script, and click Save (💾).
 * 4. Select 'addPitchAndTradeoffsColumnsWithData' from the dropdown and click Run (▶).
 * 5. This will automatically add 'pitchText' and 'tradeoffs' headers AND populate sample data across all project rows!
 */

function addPitchAndTradeoffsColumnsWithData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  var headers = data[0];
  var pitchIdx = headers.indexOf('pitchText');
  var tradeoffsIdx = headers.indexOf('tradeoffs');

  // Add headers if missing
  if (pitchIdx === -1) {
    pitchIdx = headers.length;
    sheet.getRange(1, pitchIdx + 1).setValue('pitchText').setFontWeight('bold').setBackground('#E2E8F0');
  }
  if (tradeoffsIdx === -1) {
    tradeoffsIdx = sheet.getDataRange().getValues()[0].length;
    sheet.getRange(1, tradeoffsIdx + 1).setValue('tradeoffs').setFontWeight('bold').setBackground('#E2E8F0');
  }

  // Populate rows if blank
  var numRows = data.length - 1;
  for (var i = 1; i <= numRows; i++) {
    var dev = data[i][2] || 'Grade-A Builder';
    var loc = data[i][3] || 'Prime Corridor';
    var status = data[i][5] || 'Under construction';

    var currentPitch = sheet.getRange(i + 1, pitchIdx + 1).getValue();
    var currentTradeoff = sheet.getRange(i + 1, tradeoffsIdx + 1).getValue();

    if (!currentPitch) {
      sheet.getRange(i + 1, pitchIdx + 1).setValue('Proximity to ' + loc + ' tech parks · ' + dev + ' proven delivery track record');
    }
    if (!currentTradeoff) {
      sheet.getRange(i + 1, tradeoffsIdx + 1).setValue('High demand corridor with active inventory absorption · ' + status + ' stage');
    }
  }

  SpreadsheetApp.getUi().alert('✅ Success! pitchText (Why We Recommend) and tradeoffs (Decision Trade-offs) columns & sample data populated across all rows!');
}
