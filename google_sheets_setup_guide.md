# acre&key — Google Sheets API Setup & Architecture Guide

This guide documents the single endpoint data-driven architecture connecting **Google Sheets**, **Google Apps Script**, and the **acre&key Application**.

---

## 1. Architecture Overview

```
Google Sheets (Worksheets) 
        ↓
Google Apps Script (Web App doGet Endpoint)
        ↓
Single JSON API Response
        ↓
Frontend Application (DataService.loadApplicationData())
```

- **Single GET Request**: On startup, the application makes **one network request** to load all projects, builders, localities, schools, hospitals, tech parks, metro stations, area pricing, and configuration into memory.
- **Configurable Endpoint**: Set the API URL once in `APP_CONFIG.API_ENDPOINT` inside [index.html](file:///Users/patidar/Desktop/Ank%20Map%20V3/index.html).

---

## 2. Google Spreadsheet Worksheets & Schema

Your Google Spreadsheet should contain the following **11 Worksheets**:

### Worksheet 1: `Projects`
| Column | Type | Example | Description |
|---|---|---|---|
| `id` | String | `p_1` | Unique project ID |
| `title` | String | `Evergreen at Prestige Raintree Park` | Project name |
| `developer` | String | `Prestige Group` | Developer / Builder name |
| `locality` | String | `Whitefield Main Road / Varthur Junction` | Locality name |
| `zone` | String | `Whitefield` | City zone |
| `status` | String | `Under Construction` | Construction stage (`Under Construction`, `Ready to Move`, `New Launch`) |
| `priceRange` | String | `₹1.25Cr – 1.95Cr` | Display price range |
| `bhk` | String | `2 & 3 BHK` | Configurations |
| `lat` | Number | `12.9538` | Latitude coordinate |
| `lng` | Number | `77.7458` | Longitude coordinate |
| `score` | Number | `69.9` | AK Score (0 to 100) |
| `recommended` | Boolean | `TRUE` | `TRUE` or `FALSE` |
| `pitchText` | String | `Prestige flagship township & Varthur lake proximity` | Summary highlight pitch |

### Worksheet 2: `TechParks`
| Column | Type | Example |
|---|---|---|
| `id` | String | `tp_1` |
| `name` | String | `International Tech Park Bangalore (ITPB / ITPL)` |
| `locality` | String | `Whitefield` |
| `lat` | Number | `12.9862` |
| `lng` | Number | `77.7371` |

### Worksheet 3: `MetroStations`
| Column | Type | Example |
|---|---|---|
| `id` | String | `m_1` |
| `name` | String | `Hopefarm Channasandra` |
| `line` | String | `Purple Line` |
| `lat` | Number | `12.9841` |
| `lng` | Number | `77.7479` |

### Worksheet 4: `Schools`
| Column | Type | Example |
|---|---|---|
| `id` | String | `sch_1` |
| `name` | String | `Chrysalis High Varthur` |
| `lat` | Number | `12.9467` |
| `lng` | Number | `77.7412` |

### Worksheet 5: `Hospitals`
| Column | Type | Example |
|---|---|---|
| `id` | String | `hosp_1` |
| `name` | String | `Columbia Asia Hospital Whitefield` |
| `lat` | Number | `12.9578` |
| `lng` | Number | `77.7456` |

### Worksheet 6: `Malls`
| Column | Type | Example |
|---|---|---|
| `id` | String | `mall_1` |
| `name` | String | `Nexus Whitefield (Forum Value)` |
| `lat` | Number | `12.9589` |
| `lng` | Number | `77.7432` |

### Worksheet 7: `AreaPricing`
| Column | Type | Example |
|---|---|---|
| `name` | String | `Whitefield` |
| `minPrice` | Number | `7500` |
| `maxPrice` | Number | `15000` |
| `lat` | Number | `12.9698` |
| `lng` | Number | `77.7499` |

### Worksheet 8: `Localities`
| Column | Type | Example |
|---|---|---|
| `name` | String | `KR Puram` |
| `tagline` | String | `Major transit & arterial hub with direct ORR, OMR & Blue/Purple Line connectivity.` |
| `highlight` | String | `Seamless airport & city connectivity · Competitive price points · Strong rental yields` |

---

## 3. Google Apps Script Setup & Deployment Instructions

1. Open your Google Sheet containing the worksheets above.
2. Click **Extensions** -> **Apps Script**.
3. Replace all code in `Code.gs` with the content from [google_apps_script.js](file:///Users/patidar/Desktop/Ank%20Map%20V3/google_apps_script.js).
4. Click **Deploy** -> **New Deployment**.
5. Click **Select type (gear icon)** -> **Web app**.
6. Set fields:
   - **Description**: `acre&key Data API v1`
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone`
7. Click **Deploy** and complete the authorization prompt.
8. Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).

---

## 4. Frontend API Endpoint Configuration

Open [index.html](file:///Users/patidar/Desktop/Ank%20Map%20V3/index.html) and update `APP_CONFIG`:

```javascript
const APP_CONFIG = {
  API_ENDPOINT: "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec",
  TIMEOUT_MS: 10000,
  CACHE_KEY: "ackey_cached_app_data_v1"
};
```

Whenever you edit your Google Sheet, the website will **automatically fetch and display the latest data** without any code changes or redeployments!
