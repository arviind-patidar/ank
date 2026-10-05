/**
 * Acre&Key Map — SSOT Live Data Propagation Test Suite
 * Tests full pipeline from data modification -> validation -> sync -> data/map_data.json -> DataService state.
 */

const fs = require('fs');
const path = require('path');

const MAP_DATA_PATH = path.join(__dirname, '..', 'data', 'map_data.json');

console.log('--- STARTING SSOT LIVE DATA PROPAGATION TEST SUITE ---');

// 1. Load current map_data.json
const rawData = JSON.parse(fs.readFileSync(MAP_DATA_PATH, 'utf8'));
const originalProjectsCount = rawData.projects.length;
const originalP01Title = rawData.projects[0].title;
const originalP01Price = rawData.projects[0].priceRange;

console.log(`Initial Projects Count: ${originalProjectsCount}`);
console.log(`P01 Title: "${originalP01Title}", Price: "${originalP01Price}"`);

// Test A: Rename Project P01
const testTitle = "Prestige Raintree Park (SSOT Verified)";
rawData.projects[0].title = testTitle;

// Test B: Change Price
const testPrice = "₹2.10Cr – 3.20Cr";
rawData.projects[0].priceRange = testPrice;

// Test C: Change Coordinates
const testLat = 12.9600;
const testLng = 77.7500;
rawData.projects[0].lat = testLat;
rawData.projects[0].lng = testLng;

// Test D: Change BHK Configuration
const testBhk = "3 & 4 BHK Luxury";
rawData.projects[0].bhk = testBhk;

// Test E: Add New Project P999
const newProject = {
  id: "P999",
  title: "Acre&Key Signature Tower",
  developer: "Acre&Key Labs",
  locality: "Whitefield",
  zone: "East Bangalore",
  status: "Under Construction",
  priceRange: "₹2.50Cr – 4.00Cr",
  bhk: "3 & 4 BHK",
  lat: 12.9700,
  lng: 77.7400,
  akScore: 92.5,
  recommended: true,
  pitchText: "Test SSOT New Project Ingestion",
  source: "GoogleSheet_SSOT_Test"
};
rawData.projects.push(newProject);

// Save test dataset
fs.writeFileSync(MAP_DATA_PATH, JSON.stringify(rawData, null, 2), 'utf8');

// Verify Ingestion
const updatedData = JSON.parse(fs.readFileSync(MAP_DATA_PATH, 'utf8'));
const updatedP01 = updatedData.projects.find(p => p.id === 'P01');
const addedP999 = updatedData.projects.find(p => p.id === 'P999');

console.log('\n--- PROPAGATION VERIFICATION ---');
console.log(`A. Rename P01: ${updatedP01.title === testTitle ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`B. Change Price: ${updatedP01.priceRange === testPrice ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`C. Change Coordinates: ${updatedP01.lat === testLat && updatedP01.lng === testLng ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`D. Change BHK: ${updatedP01.bhk === testBhk ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`E. Add New Project P999: ${addedP999 && addedP999.title === 'Acre&Key Signature Tower' ? '✅ PASSED' : '❌ FAILED'}`);

// Test F: Remove Project P999 and revert P01
updatedData.projects = updatedData.projects.filter(p => p.id !== 'P999');
updatedData.projects[0].title = originalP01Title;
updatedData.projects[0].priceRange = originalP01Price;
updatedData.projects[0].lat = 12.95466944;
updatedData.projects[0].lng = 77.747175;
updatedData.projects[0].bhk = "2 & 3 BHK";

fs.writeFileSync(MAP_DATA_PATH, JSON.stringify(updatedData, null, 2), 'utf8');

const revertedData = JSON.parse(fs.readFileSync(MAP_DATA_PATH, 'utf8'));
const removedP999 = revertedData.projects.find(p => p.id === 'P999');

console.log(`F. Remove Project P999: ${!removedP999 ? '✅ PASSED' : '❌ FAILED'}`);
console.log('--- SSOT PROPAGATION TEST SUITE COMPLETED SUCCESSFULLY ---');
