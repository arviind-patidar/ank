const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

const engineCode = `
/* ==================================================
 * ACRE&KEY — AREA PRICING & DENSITY ENGINE (DYNAMIC SSOT)
 * ================================================== */

function getAreaPricingBounds() {
  const points = typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : [];
  if (!points || points.length === 0) return { minPrice: 6000, maxPrice: 18000 };
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  points.forEach(pt => {
    const p = Number(pt.avgPrice || pt.pricePerSqft);
    if (!isNaN(p) && p > 0) {
      if (p < minPrice) minPrice = p;
      if (p > maxPrice) maxPrice = p;
    }
  });
  if (minPrice === Infinity || maxPrice === -Infinity || minPrice === maxPrice) {
    return { minPrice: 6000, maxPrice: 18000 };
  }
  return { minPrice, maxPrice };
}

function colorForPriceNormalized(price) {
  const { minPrice, maxPrice } = getAreaPricingBounds();
  const range = (maxPrice - minPrice) || 1;
  const norm = Math.max(0, Math.min(1, (price - minPrice) / range));
  
  let r, g, b;
  if (norm <= 0.35) {
    const f = norm / 0.35;
    r = 168 + (246 - 168) * f;
    g = 216 + (227 - 216) * f;
    b = 185 + (161 - 185) * f;
  } else if (norm <= 0.70) {
    const f = (norm - 0.35) / 0.35;
    r = 246 + (245 - 246) * f;
    g = 227 + (197 - 227) * f;
    b = 161 + (138 - 161) * f;
  } else {
    const f = (norm - 0.70) / 0.30;
    r = 245 + (216 - 245) * f;
    g = 197 + (124 - 197) * f;
    b = 138 + (114 - 138) * f;
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

function updateAreaPriceLegendUI() {
  const { minPrice, maxPrice } = getAreaPricingBounds();
  const legendMin = document.getElementById("priceLegendMinVal");
  const legendMax = document.getElementById("priceLegendMaxVal");
  if (legendMin) legendMin.textContent = \`₹\${Math.round(minPrice / 1000)}K/sq.ft\`;
  if (legendMax) legendMax.textContent = \`₹\${Math.round(maxPrice / 1000)}K/sq.ft\`;
}

function updateAreaPricingDebugState() {
  const points = typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : [];
  const { minPrice, maxPrice } = getAreaPricingBounds();
  const overlay = areaPriceDensityOverlay;
  const canvas = overlay ? overlay.canvas : null;
  
  window.__ANK_AREA_PRICING_DEBUG__ = {
    recordCount: (AREA_PRICING || []).length,
    validCoordinates: (AREA_PRICING || []).filter(a => typeof a.lat === "number" && typeof a.lng === "number" && !isNaN(a.lat) && !isNaN(a.lng)).length,
    validPrices: (AREA_PRICING || []).filter(a => typeof a.avgPrice === "number" && !isNaN(a.avgPrice) && a.avgPrice > 0).length,
    minPrice: minPrice,
    maxPrice: maxPrice,
    canvasWidth: canvas ? canvas.width : 0,
    canvasHeight: canvas ? canvas.height : 0,
    visiblePointCount: points.length,
    overlayVisible: Boolean(areaPriceViewActive),
    currentZoom: (typeof map !== "undefined" && map) ? map.getZoom() : 0
  };
}
`;

// Replace getAreaPricingBounds or colorForPrice function blocks
if (!html.includes('function getAreaPricingBounds()')) {
  html = html.replace('function ensureComprehensiveAreaPricing() {', engineCode + '\nfunction ensureComprehensiveAreaPricing() {');
  console.log('✅ Injected getAreaPricingBounds, colorForPriceNormalized, updateAreaPriceLegendUI, and updateAreaPricingDebugState!');
}

// Update defineAreaPriceDensityOverlayClass to call colorForPriceNormalized & updateAreaPricingDebugState
const overlayTarget = `function defineAreaPriceDensityOverlayClass() {
  return class extends google.maps.OverlayView {
    constructor(gmap) {
      super();
      this.canvas = null;
      this.points = [];
      this.setMap(gmap);
    }
    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "area-price-density-canvas";
      this.canvas.style.position = "absolute";
      this.canvas.style.pointerEvents = "none";
      const panes = this.getPanes();
      const parentPane = panes.overlayLayer || panes.mapPane;
      if (parentPane) parentPane.appendChild(this.canvas);
    }
    onRemove() {
      if (this.canvas) {
        if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
      }
    }
    setPoints(points) {
      this.points = points || [];
      if (this.canvas) {
        if (this.points && this.points.length > 0) {
          this.canvas.classList.add("area-price-density-canvas--visible");
        } else {
          this.canvas.classList.remove("area-price-density-canvas--visible");
        }
      }
      this.draw();
    }
    draw() {
      if (!this.canvas) return;
      const projection = this.getProjection(); if (!projection) return;
      const gmap = this.getMap(); if (!gmap) return;
      const bounds = gmap.getBounds();
      const pts = (this.points && this.points.length > 0) ? this.points : (typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : []);

      if (!bounds || !pts || pts.length === 0) {
        return;
      }

      this.canvas.classList.add("area-price-density-canvas--visible");

      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      if (!ne || !sw) return;

      const minX = Math.min(sw.x, ne.x);
      const maxX = Math.max(sw.x, ne.x);
      const minY = Math.min(sw.y, ne.y);
      const maxY = Math.max(sw.y, ne.y);

      const width = Math.max(1, Math.round(maxX - minX));
      const height = Math.max(1, Math.round(maxY - minY));

      this.canvas.style.left = minX + "px";
      this.canvas.style.top = minY + "px";
      this.canvas.width = width;
      this.canvas.height = height;

      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const zoom = gmap.getZoom() || 12;
      const baseRadius = Math.max(85, Math.min(170, (zoom - 9) * 30 + 85));

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        if (!pixel) return;

        const x = pixel.x - minX;
        const y = pixel.y - minY;
        if (x < -baseRadius * 2 || x > width + baseRadius * 2 || y < -baseRadius * 2 || y > height + baseRadius * 2) return;

        const avgPrice = pt.avgPrice || 10500;
        const [r, g, b] = typeof colorForPrice === "function" ? colorForPrice(avgPrice) : [216, 124, 114];
        const rRadius = baseRadius;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, rRadius);
        grad.addColorStop(0.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.78)\`);
        grad.addColorStop(0.40, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.52)\`);
        grad.addColorStop(0.75, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.22)\`);
        grad.addColorStop(1.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.00)\`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
}`;

const overlayClassReplacement = `function defineAreaPriceDensityOverlayClass() {
  return class extends google.maps.OverlayView {
    constructor(gmap) {
      super();
      this.canvas = null;
      this.points = [];
      this.setMap(gmap);
    }
    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "area-price-density-canvas";
      this.canvas.style.position = "absolute";
      this.canvas.style.pointerEvents = "none";
      const panes = this.getPanes();
      const parentPane = panes.overlayLayer || panes.mapPane;
      if (parentPane) parentPane.appendChild(this.canvas);
    }
    onRemove() {
      if (this.canvas) {
        if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
      }
    }
    setPoints(points) {
      this.points = points || [];
      if (this.canvas) {
        if (this.points && this.points.length > 0) {
          this.canvas.classList.add("area-price-density-canvas--visible");
        } else {
          this.canvas.classList.remove("area-price-density-canvas--visible");
        }
      }
      this.draw();
    }
    draw() {
      if (!this.canvas) return;
      const projection = this.getProjection(); if (!projection) return;
      const gmap = this.getMap(); if (!gmap) return;
      const bounds = gmap.getBounds();
      const pts = (this.points && this.points.length > 0) ? this.points : (typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : []);

      if (!bounds || !pts || pts.length === 0) {
        return;
      }

      this.canvas.classList.add("area-price-density-canvas--visible");

      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      if (!ne || !sw) return;

      const minX = Math.min(sw.x, ne.x);
      const maxX = Math.max(sw.x, ne.x);
      const minY = Math.min(sw.y, ne.y);
      const maxY = Math.max(sw.y, ne.y);

      const width = Math.max(1, Math.round(maxX - minX));
      const height = Math.max(1, Math.round(maxY - minY));

      this.canvas.style.left = minX + "px";
      this.canvas.style.top = minY + "px";
      this.canvas.width = width;
      this.canvas.height = height;

      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const zoom = gmap.getZoom() || 12;
      const baseRadius = Math.max(90, Math.min(180, (zoom - 9) * 32 + 90));

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        if (!pixel) return;

        const x = pixel.x - minX;
        const y = pixel.y - minY;
        if (x < -baseRadius * 2 || x > width + baseRadius * 2 || y < -baseRadius * 2 || y > height + baseRadius * 2) return;

        const avgPrice = pt.avgPrice || 10500;
        const [r, g, b] = typeof colorForPriceNormalized === "function" ? colorForPriceNormalized(avgPrice) : [216, 124, 114];
        const rRadius = baseRadius;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, rRadius);
        grad.addColorStop(0.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.82)\`);
        grad.addColorStop(0.40, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.55)\`);
        grad.addColorStop(0.75, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.25)\`);
        grad.addColorStop(1.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.00)\`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (typeof updateAreaPricingDebugState === "function") updateAreaPricingDebugState();
      if (typeof updateAreaPriceLegendUI === "function") updateAreaPriceLegendUI();
    }
  };
}`;

if (html.includes(overlayTarget)) {
  html = html.replace(overlayTarget, overlayClassReplacement);
  console.log('✅ Updated defineAreaPriceDensityOverlayClass with normalized price coloring & debug state!');
} else {
  console.log('⚠️ Could not match overlayTarget');
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Full Area Pricing Engine Script Complete!');
