const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

// 1. Add ensureComprehensiveAreaPricing function
const compFunction = `
function ensureComprehensiveAreaPricing() {
  const areaMap = {};

  // Preserve explicit static area pricing entries if available
  (AREA_PRICING || []).forEach(ap => {
    if (ap && ap.name) {
      areaMap[ap.name.toLowerCase().trim()] = { ...ap, projectCount: 0, latSum: 0, lngSum: 0, priceSum: 0 };
    }
  });

  // Group ALL_PROPERTIES by locality to guarantee 100% micro-market pricing coverage across Bengaluru
  (ALL_PROPERTIES || []).forEach(p => {
    if (!p) return;
    const loc = (p.locality || p.microMarket || p.zone || 'Bengaluru').trim();
    const key = loc.toLowerCase();
    const lat = typeof p.lat === 'number' ? p.lat : parseFloat(p.lat);
    const lng = typeof p.lng === 'number' ? p.lng : parseFloat(p.lng);

    let priceSqft = p.pricePerSqft;
    if (!priceSqft || isNaN(priceSqft)) {
      if (p.priceMinLakhs && !isNaN(p.priceMinLakhs)) {
        const estSqft = p.bhk && String(p.bhk).includes("3") ? 1500 : (p.bhk && String(p.bhk).includes("2") ? 1100 : 1300);
        priceSqft = Math.round((p.priceMinLakhs * 100000) / estSqft);
      } else {
        priceSqft = 9500;
      }
    }

    if (!isNaN(lat) && !isNaN(lng)) {
      if (!areaMap[key]) {
        areaMap[key] = {
          id: 'AP_GEN_' + Object.keys(areaMap).length,
          name: loc,
          zone: p.zone || 'Bengaluru',
          latSum: lat,
          lngSum: lng,
          priceSum: priceSqft,
          minPrice: priceSqft,
          maxPrice: priceSqft,
          projectCount: 1,
          category: 'Residential Corridor'
        };
      } else {
        const entry = areaMap[key];
        entry.latSum = (entry.latSum || (entry.lat * (entry.projectCount || 1))) + lat;
        entry.lngSum = (entry.lngSum || (entry.lng * (entry.projectCount || 1))) + lng;
        entry.priceSum = (entry.priceSum || (entry.avgPrice * (entry.projectCount || 1))) + priceSqft;
        entry.minPrice = Math.min(entry.minPrice || priceSqft, priceSqft);
        entry.maxPrice = Math.max(entry.maxPrice || priceSqft, priceSqft);
        entry.projectCount = (entry.projectCount || 0) + 1;
      }
    }
  });

  AREA_PRICING = Object.values(areaMap).map(e => {
    const count = e.projectCount || 1;
    const lat = e.latSum ? e.latSum / count : e.lat;
    const lng = e.lngSum ? e.lngSum / count : e.lng;
    const avgPrice = e.priceSum ? Math.round(e.priceSum / count) : e.avgPrice;
    return {
      id: e.id,
      name: e.name,
      zone: e.zone || 'Bengaluru',
      avgPrice: avgPrice || 10500,
      minPrice: e.minPrice || avgPrice || 8000,
      maxPrice: e.maxPrice || avgPrice || 14000,
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5)),
      category: e.category || 'Residential Corridor',
      projectCount: count
    };
  });
}
`;

if (!html.includes('function ensureComprehensiveAreaPricing')) {
  html = html.replace('function getVisibleAreaPricing() {', compFunction + '\nfunction getVisibleAreaPricing() {');
  console.log('✅ Added ensureComprehensiveAreaPricing function');
}

// 2. Call ensureComprehensiveAreaPricing inside updateGlobalState
if (html.includes('AREA_PRICING = parsed.areaPricing || [];') && !html.includes('ensureComprehensiveAreaPricing();')) {
  html = html.replace('AREA_PRICING = parsed.areaPricing || [];', 'AREA_PRICING = parsed.areaPricing || [];\n    ensureComprehensiveAreaPricing();');
  console.log('✅ Added ensureComprehensiveAreaPricing() call in updateGlobalState');
}

// 3. Update defineAreaPriceLabelLayerClass for full zoom rendering & proper formatting
const labelTarget = `      this.container.innerHTML = "";
      if (!priceLabelsEnabled || gmap.getZoom() < 11.5 || !this.points || this.points.length === 0) return;

      const placed = [];
      const sorted = this.points.slice().sort((a, b) => b.avgPrice - a.avgPrice);
      const frag = document.createDocumentFragment();

      sorted.forEach((pt) => {
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        const tooClose = placed.some((p) => Math.hypot(p.x - pixel.x, p.y - pixel.y) < 46);
        if (tooClose) return;
        placed.push({ x: pixel.x, y: pixel.y });

        const div = document.createElement("div");
        div.className = "area-price-label"; div.style.left = pixel.x + "px"; div.style.top = pixel.y + "px";
        div.textContent = \`₹\${Math.round(pt.avgPrice).toLocaleString("en-IN")}\`;
        frag.appendChild(div);
      });`;

const labelReplacement = `      this.container.innerHTML = "";
      if (!priceLabelsEnabled || gmap.getZoom() < 9.0 || !this.points || this.points.length === 0) return;

      const currentZoom = gmap.getZoom() || 12;
      const collisionDist = currentZoom >= 13 ? 24 : (currentZoom >= 11 ? 32 : 44);

      const placed = [];
      const sorted = this.points.slice().sort((a, b) => b.avgPrice - a.avgPrice);
      const frag = document.createDocumentFragment();

      sorted.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number") return;
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        const tooClose = placed.some((p) => Math.hypot(p.x - pixel.x, p.y - pixel.y) < collisionDist);
        if (tooClose) return;
        placed.push({ x: pixel.x, y: pixel.y });

        const div = document.createElement("div");
        div.className = "area-price-label"; div.style.left = pixel.x + "px"; div.style.top = pixel.y + "px";
        div.innerHTML = \`<span style="font-size:10px; font-weight:800; color:#F7FAFC;">\${escapeHtml(pt.name)}</span><br/><span style="color:var(--gold, #C55A11); font-weight:800; font-size:11px;">₹\${Math.round(pt.avgPrice).toLocaleString("en-IN")}/sqft</span>\`;
        frag.appendChild(div);
      });`;

if (html.includes(labelTarget)) {
  html = html.replace(labelTarget, labelReplacement);
  console.log('✅ Updated area price label layer with lower zoom threshold & micro-market name labels');
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Area pricing enhancement complete!');
