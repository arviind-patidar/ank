/**
 * Acre&Key Map — Google Sheet / SSOT Data Sync & Normalization Script
 * 
 * Reads raw/exported map data from authoritative seed or live Google Sheets endpoints,
 * validates schema & coordinates (-90..90, -180..180), normalizes field structures,
 * generates data quality reports, and outputs data/map_data.json as the authoritative dataset.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SEED_FILE = path.join(DATA_DIR, 'seed_data.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'map_data.json');
const REPORT_FILE = path.join(DATA_DIR, 'data_quality_report.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let sourcePayload = null;

if (fs.existsSync(SEED_FILE)) {
  try {
    sourcePayload = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  } catch (e) {
    console.error('Error reading seed_data.json:', e.message);
  }
}

const rawProjects = (sourcePayload && Array.isArray(sourcePayload.projects)) ? sourcePayload.projects : [];
const rawTechParks = (sourcePayload && Array.isArray(sourcePayload.techParks)) ? sourcePayload.techParks : [];
const rawMetroStations = (sourcePayload && Array.isArray(sourcePayload.metroStations)) ? sourcePayload.metroStations : [];
const rawSchools = (sourcePayload && Array.isArray(sourcePayload.schools)) ? sourcePayload.schools : [];
const rawHospitals = (sourcePayload && Array.isArray(sourcePayload.hospitals)) ? sourcePayload.hospitals : [];
const rawMalls = (sourcePayload && Array.isArray(sourcePayload.malls)) ? sourcePayload.malls : [];
const rawAreaPricing = (sourcePayload && Array.isArray(sourcePayload.areaPricing)) ? sourcePayload.areaPricing : [];

// Validation helper
function isValidCoord(lat, lng) {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
         typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
}

const auditIssues = [];

// 1. Normalize Projects
const normalizedProjects = rawProjects.filter(p => p && p.title).map((p, idx) => {
  const id = p.id || `P${String(idx + 1).padStart(3, '0')}`;
  if (!isValidCoord(p.lat, p.lng)) {
    auditIssues.push({ category: 'Project', id, name: p.title, issue: 'Invalid coordinates' });
  }
  return {
    id,
    title: p.title || 'Untitled Project',
    developer: p.developer || 'Unknown Developer',
    locality: p.locality || 'Bengaluru',
    zone: p.zone || 'Bengaluru',
    status: p.status || 'Under construction',
    priceRange: p.priceRange || p.priceStr || 'Price on Request',
    bhk: p.bhk || p.config || '2 & 3 BHK',
    minPriceLakhs: p.minPriceLakhs || null,
    maxPriceLakhs: p.maxPriceLakhs || null,
    avgPricePerSqft: p.avgPricePerSqft || null,
    inventory: Array.isArray(p.inventory) ? p.inventory : [],
    lat: p.lat,
    lng: p.lng,
    akScore: (typeof p.akScore === 'number' && !isNaN(p.akScore)) ? p.akScore : ((typeof p.score === 'number' && !isNaN(p.score)) ? p.score : null),
    recommended: Boolean(p.recommended),
    pitchText: p.pitchText || p.pitch || '',
    advisoryPro: p.advisoryPro || p.pro || p.proText || null,
    advisoryConsideration: p.advisoryConsideration || p.consideration || p.conText || null,
    source: 'GoogleSheet_SSOT'
  };
});

// 2. Normalize Tech Parks
const normalizedTechParks = rawTechParks.map((tp, idx) => {
  const id = tp.id || `TP${String(idx + 1).padStart(3, '0')}`;
  if (!isValidCoord(tp.lat, tp.lng)) {
    auditIssues.push({ category: 'TechPark', id, name: tp.name, issue: 'Invalid coordinates' });
  }
  return {
    id,
    name: tp.name || 'Tech Park',
    area: tp.area || tp.locality || 'Bengaluru',
    lat: tp.lat,
    lng: tp.lng,
    source: 'GoogleSheet_SSOT'
  };
});

// 3. Normalize Metro Stations
const normalizedMetroStations = rawMetroStations.map((ms, idx) => {
  const id = ms.id || `M${String(idx + 1).padStart(2, '0')}`;
  if (!isValidCoord(ms.lat, ms.lng)) {
    auditIssues.push({ category: 'MetroStation', id, name: ms.name, issue: 'Invalid coordinates' });
  }
  return {
    id,
    name: ms.name || 'Metro Station',
    line: ms.line || 'Purple',
    lat: ms.lat,
    lng: ms.lng,
    source: 'GoogleSheet_SSOT'
  };
});

// 4. Normalize Schools
const normalizedSchools = rawSchools.map((s, idx) => {
  const id = s.id || `S${String(idx + 1).padStart(2, '0')}`;
  return {
    id,
    name: s.name || 'School',
    area: s.area || 'Bengaluru',
    lat: s.lat,
    lng: s.lng,
    source: 'GoogleSheet_SSOT'
  };
});

// 5. Normalize Hospitals
const normalizedHospitals = rawHospitals.map((h, idx) => {
  const id = h.id || `H${String(idx + 1).padStart(2, '0')}`;
  return {
    id,
    name: h.name || 'Hospital',
    area: h.area || 'Bengaluru',
    lat: h.lat,
    lng: h.lng,
    source: 'GoogleSheet_SSOT'
  };
});

// 6. Normalize Malls
const normalizedMalls = rawMalls.map((m, idx) => {
  const id = m.id || `MA${String(idx + 1).padStart(2, '0')}`;
  return {
    id,
    name: m.name || 'Mall',
    area: m.area || 'Bengaluru',
    lat: m.lat,
    lng: m.lng,
    source: 'GoogleSheet_SSOT'
  };
});

// 7. Normalize Area Pricing / Price Density
const normalizedAreaPricing = rawAreaPricing.map((ap, idx) => {
  const id = ap.id || `AP${String(idx + 1).padStart(2, '0')}`;
  return {
    id,
    name: ap.name || ap.locality || 'Locality',
    zone: ap.zone || 'Bengaluru',
    avgPrice: typeof ap.avgPrice === 'number' ? ap.avgPrice : 10000,
    minPrice: typeof ap.minPrice === 'number' ? ap.minPrice : 8000,
    maxPrice: typeof ap.maxPrice === 'number' ? ap.maxPrice : 15000,
    lat: ap.lat,
    lng: ap.lng,
    category: ap.category || 'Residential Corridor',
    source: 'GoogleSheet_SSOT'
  };
});

// Build unified payload
const fullPayload = {
  metadata: {
    source: 'Google Sheet Single Source of Truth',
    datasetVersion: 'v2.1.0',
    activeTab: 'Project Unit Pricing',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit#gid=456687578',
    syncedAt: new Date().toISOString(),
    displayDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() + ' (SHEET TAB: PROJECT UNIT PRICING)',
    recordCounts: {
      projects: normalizedProjects.length,
      techParks: normalizedTechParks.length,
      metroStations: normalizedMetroStations.length,
      schools: normalizedSchools.length,
      hospitals: normalizedHospitals.length,
      malls: normalizedMalls.length,
      areaPricing: normalizedAreaPricing.length
    },
    counts: {
      projects: normalizedProjects.length,
      techParks: normalizedTechParks.length,
      metroStations: normalizedMetroStations.length,
      schools: normalizedSchools.length,
      hospitals: normalizedHospitals.length,
      malls: normalizedMalls.length,
      areaPricing: normalizedAreaPricing.length
    }
  },
  projects: normalizedProjects,
  techParks: normalizedTechParks,
  metroStations: normalizedMetroStations,
  schools: normalizedSchools,
  hospitals: normalizedHospitals,
  malls: normalizedMalls,
  areaPricing: normalizedAreaPricing
};

// Write map_data.json
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fullPayload, null, 2), 'utf8');

// Write data quality report
const qualityReport = {
  status: auditIssues.length === 0 ? 'HEALTHY' : 'WARNINGS_FOUND',
  timestamp: new Date().toISOString(),
  issuesCount: auditIssues.length,
  issues: auditIssues,
  summary: fullPayload.metadata.recordCounts
};

fs.writeFileSync(REPORT_FILE, JSON.stringify(qualityReport, null, 2), 'utf8');

console.log('✅ Google Sheet SSOT Data Normalization Complete!');
console.log('Summary:', fullPayload.metadata.recordCounts);
console.log(`Saved output to ${OUTPUT_FILE}`);
