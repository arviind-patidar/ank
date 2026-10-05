# Acre&Key Map — Google Sheet Data Source Architecture & Integration Guide

## 1. Single Source of Truth Overview
All map business data for **Acre&Key Bengaluru Property Intelligence Map** originates from the authoritative Google Sheet. The frontend application (`index.html`) consumes a normalized data layer (`data/map_data.json`) managed via the `DataService` repository pattern.

- **Google Sheet URL**: [https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit#gid=1841720749](https://docs.google.com/spreadsheets/d/1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE/edit#gid=1841720749)
- **Primary Data Asset**: `data/map_data.json`
- **Quality Audit Asset**: `data/data_quality_report.json`
- **Sync Script**: `scripts/sync_sheet_data.js`
- **Propagation Test Suite**: `scripts/test_ssot_propagation.js`

---

## 2. Complete Data Flow & Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      GOOGLE SHEET                            │
│  (ID: 1PsahoCsoWKiCUlwBmdxj9U36jquUSJnrG2ejsnn7xdE)          │
└──────────────────────────────┬───────────────────────────────┘
                               │ Machine-readable export / Web Feed
                               ▼
┌──────────────────────────────────────────────────────────────┐
│            INGESTION & VALIDATION ENGINE                     │
│               (scripts/sync_sheet_data.js)                   │
│  - Coordinate validation (-90 to 90, -180 to 180)            │
│  - Unique ID enforcement & title presence checks             │
│  - Price string & Lakhs range normalization                  │
│  - Generates data/data_quality_report.json audit report      │
└──────────────────────────────┬───────────────────────────────┘
                               │ Outputs normalized JSON
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               GENERATED ARTIFACT / CACHE LAYER               │
│                     (data/map_data.json)                     │
│  - Contains metadata: datasetVersion, syncedAt, recordCounts │
│  - Never manually edited; regenerated on Sheet updates       │
└──────────────────────────────┬───────────────────────────────┘
                               │ 0ms localStorage cache / fetch
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND REPOSITORY                       │
│                 (DataService in index.html)                  │
│  - In-memory state: ALL_PROPERTIES, METRO_STATIONS, etc.     │
│  - Zero repeated Google Sheet HTTP requests on zoom/pan/filter│
└──────────────────────────────┬───────────────────────────────┘
                               │ Shared dataset
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 APPLICATION & UI CONSUMERS                   │
│  - Customer Personalization Matching Engine                  │
│  - Team / Advisor Mode & Exclusion Inspector                 │
│  - Metro, Tech Park, School, Hospital, Mall & Price Heatmaps  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Schema & Column Mappings

### A. Projects (`Projects` tab)
| Google Sheet Column | Canonical Field | Data Type | Validation Rules |
| :--- | :--- | :--- | :--- |
| `Project ID` | `id` | String | Unique, e.g. `P01` |
| `Project Name` | `title` | String | Required |
| `Developer` | `developer` | String | Required |
| `Locality` | `locality` | String | Required |
| `Zone / Corridor` | `zone` | String | Required |
| `Status` | `status` | String | `Under construction` / `Ready to move` |
| `Price Range` | `priceRange` | String | e.g. `₹1.25Cr – 1.95Cr` |
| `Configurations` | `bhk` | String | e.g. `2 & 3 BHK` |
| `Latitude` | `lat` | Number | -90 to 90 |
| `Longitude` | `lng` | Number | -180 to 180 |
| `Acre&Key Score` | `akScore` | Number | 0 to 100 |
| `Acre&Key Recommended` | `recommended` | Boolean | `true` / `false` |
| `Pitch / Highlights` | `pitchText` | String | Optional |

### B. Tech Parks (`TechParks` tab)
| Google Sheet Column | Canonical Field | Data Type |
| :--- | :--- | :--- |
| `Park ID` | `id` | String |
| `Park Name` | `name` | String |
| `Area / Locality` | `area` | String |
| `Latitude` | `lat` | Number |
| `Longitude` | `lng` | Number |

### C. Metro Stations (`MetroStations` tab)
| Google Sheet Column | Canonical Field | Data Type |
| :--- | :--- | :--- |
| `Station ID` | `id` | String |
| `Station Name` | `name` | String |
| `Metro Line` | `line` | String (`Purple`, `Green`, `Yellow`, `Blue`, `Pink`) |
| `Latitude` | `lat` | Number |
| `Longitude` | `lng` | Number |

### D. Price Density (`PriceDensity` tab)
| Google Sheet Column | Canonical Field | Data Type |
| :--- | :--- | :--- |
| `Locality ID` | `id` | String |
| `Locality Name` | `name` | String |
| `Average Price / Sqft` | `avgPrice` | Number |
| `Min Price / Sqft` | `minPrice` | Number |
| `Max Price / Sqft` | `maxPrice` | Number |
| `Latitude` | `lat` | Number |
| `Longitude` | `lng` | Number |
| `Category` | `category` | String |

---

## 4. How to Update & Verify Map Data

1. **Edit Google Sheet**: Add, edit, or update property details, prices, coordinates, or metro stations in the Google Sheet.
2. **Run Sync & Test Command**:
   ```bash
   node scripts/sync_sheet_data.js && node scripts/test_ssot_propagation.js
   ```
3. **Verify Data Health Report**: Inspect `data/data_quality_report.json` for zero errors/warnings.
4. **Deploy Updates**: Commit and push `data/map_data.json` to GitHub (`main`).

---

## 5. Security, Caching & Isolation Guarantee
- **Zero Credentials Exposure**: No private API keys or OAuth secrets are stored in client-side JS.
- **Zero Redundant HTTP Requests**: Map interactions (pan, zoom, hover, filter, layer toggle) consume `DataService` in-memory state.
- **Malformed Row Isolation**: Invalid coordinates or missing titles are isolated during ingestion without crashing the map canvas.
- **Offline & Storage Fallback**: If network is unavailable, `DataService` loads from `localStorage` cache or `data/map_data.json` and renders a live status banner.
