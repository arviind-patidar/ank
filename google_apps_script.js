/**
 * acre&key — Google Apps Script Web App Data Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet containing worksheets:
 *    Projects, Builders, Localities, Schools, Hospitals, TechParks, MetroStations, AreaPricing, Infrastructure, MapLayers, Configuration
 * 2. Click Extensions -> Apps Script.
 * 3. Replace all code in Code.gs with this code.
 * 4. Click Deploy -> New Deployment.
 * 5. Select type: Web app.
 * 6. Set "Execute as": Me.
 * 7. Set "Who has access": Anyone.
 * 8. Click Deploy and copy the Web App URL into APP_CONFIG.API_ENDPOINT in index.html.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var data = {
      projects: getSheetData(ss, "Projects"),
      builders: getSheetData(ss, "Builders"),
      localities: getSheetData(ss, "Localities"),
      schools: getSheetData(ss, "Schools"),
      hospitals: getSheetData(ss, "Hospitals"),
      techParks: getSheetData(ss, "TechParks"),
      metroStations: getSheetData(ss, "MetroStations"),
      areaPricing: getSheetData(ss, "AreaPricing"),
      infrastructure: getSheetData(ss, "Infrastructure"),
      mapLayers: getSheetData(ss, "MapLayers"),
      configuration: getSheetKeyValueData(ss, "Configuration")
    };

    var output = JSON.stringify({
      status: "success",
      timestamp: new Date().toISOString(),
      data: data
    });

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errorOutput = JSON.stringify({
      status: "error",
      message: err.toString(),
      timestamp: new Date().toISOString()
    });

    return ContentService.createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0].map(function(h) { return h.toString().trim(); });
  var result = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    var hasValue = false;

    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      var key = headers[j];
      if (!key) continue;

      if (val !== "" && val !== null && val !== undefined) {
        hasValue = true;
      }

      if (val === "TRUE" || val === true) val = true;
      else if (val === "FALSE" || val === false) val = false;
      else if (typeof val === "string" && !isNaN(val) && val.trim() !== "") {
        val = Number(val);
      }

      obj[key] = val;
    }

    if (hasValue) {
      result.push(obj);
    }
  }

  return result;
}

function getSheetKeyValueData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {};

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};

  var result = {};
  for (var i = 1; i < values.length; i++) {
    var key = values[i][0];
    var val = values[i][1];
    if (key) {
      result[key.toString().trim()] = val;
    }
  }

  return result;
}
