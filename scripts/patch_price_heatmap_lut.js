const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

const oldOverlayClassTarget = `function defineAreaPriceDensityOverlayClass() {
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
      this.canvas.style.zIndex = "2";
      this.canvas.style.transition = "opacity 240ms ease";
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
        this.canvas.style.opacity = (this.points && this.points.length > 0) ? "1" : "0";
      }
      this.draw();
    }
    draw() {
      if (!this.canvas) return;
      const projection = this.getProjection(); if (!projection) return;
      const gmap = this.getMap(); if (!gmap) return;
      const bounds = gmap.getBounds();
      if (!bounds) return;

      const pts = (this.points && this.points.length > 0) ? this.points : (typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : []);
      if (!pts || pts.length === 0) {
        this.canvas.width = 0;
        this.canvas.height = 0;
        return;
      }

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
      const radius = Math.max(70, Math.min(160, (zoom - 9) * 25 + 75));
      const peakAlpha = 0.65;

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const avgP = pt.avgPrice || 10500;
        const [r, g, b] = colorForPrice(avgP);
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        if (!pixel) return;

        const x = pixel.x - minX;
        const y = pixel.y - minY;

        if (x < -radius * 2 || x > width + radius * 2 || y < -radius * 2 || y > height + radius * 2) return;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha})\`);
        grad.addColorStop(0.35, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha * 0.60})\`);
        grad.addColorStop(0.70, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha * 0.25})\`);
        grad.addColorStop(1.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},0)\`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
}`;

const newOverlayClassReplacement = `function defineAreaPriceDensityOverlayClass() {
  const PRICE_PALETTE_STOPS = [
    [0.00, 168, 216, 185, 120], // Soft Mint (₹6k)
    [0.30, 246, 227, 161, 160], // Soft Yellow (₹8.5k)
    [0.65, 245, 197, 138, 195], // Soft Orange (₹11k)
    [1.00, 216, 124, 114, 235]  // Terracotta Red (₹14k+)
  ];

  const PRICE_COLOR_LUT = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let r = 216, g = 124, b = 114, a = 235;
    if (t <= 0) {
      r = 0; g = 0; b = 0; a = 0;
    } else {
      for (let s = 0; s < PRICE_PALETTE_STOPS.length - 1; s++) {
        const [t0, r0, g0, b0, a0] = PRICE_PALETTE_STOPS[s];
        const [t1, r1, g1, b1, a1] = PRICE_PALETTE_STOPS[s + 1];
        if (t >= t0 && t <= t1) {
          const f = (t - t0) / (t1 - t0 || 1);
          r = r0 + (r1 - r0) * f;
          g = g0 + (g1 - g0) * f;
          b = b0 + (b1 - b0) * f;
          a = a0 + (a1 - a0) * f;
          break;
        }
      }
    }
    PRICE_COLOR_LUT[i * 4]     = Math.round(r);
    PRICE_COLOR_LUT[i * 4 + 1] = Math.round(g);
    PRICE_COLOR_LUT[i * 4 + 2] = Math.round(b);
    PRICE_COLOR_LUT[i * 4 + 3] = Math.round(a);
  }

  return class extends google.maps.OverlayView {
    constructor(gmap) {
      super();
      this.canvas = null;
      this.points = [];
      this.setMap(gmap);
    }
    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.className = "tech-park-density-canvas";
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
          this.canvas.classList.add("tech-park-density-canvas--visible");
        } else {
          this.canvas.classList.remove("tech-park-density-canvas--visible");
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
        this.canvas.width = 0; this.canvas.height = 0;
        this.canvas.classList.remove("tech-park-density-canvas--visible");
        return;
      }

      this.canvas.classList.add("tech-park-density-canvas--visible");

      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      const width = Math.max(1, Math.round(Math.abs(ne.x - sw.x)));
      const height = Math.max(1, Math.round(Math.abs(sw.y - ne.y)));

      this.canvas.style.left = sw.x + "px";
      this.canvas.style.top = ne.y + "px";
      this.canvas.width = width;
      this.canvas.height = height;

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.clearRect(0, 0, width, height);

      const zoom = gmap.getZoom() || 12;
      const baseRadius = Math.max(75, Math.min(140, (zoom - 9) * 22 + 75));

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        const x = pixel.x - sw.x; const y = pixel.y - ne.y;
        if (x < -baseRadius * 2 || x > width + baseRadius * 2 || y < -baseRadius * 2 || y > height + baseRadius * 2) return;

        const avgPrice = pt.avgPrice || 10500;
        const priceWeight = Math.max(0.15, Math.min(1.0, (avgPrice - 6000) / 8000));
        const r = baseRadius * Math.sqrt(0.8 + priceWeight * 0.4);

        const grad = offCtx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0.00, \`rgba(0,0,0, \${Math.min(0.65, 0.35 + priceWeight * 0.35)})\`);
        grad.addColorStop(0.35, \`rgba(0,0,0, \${Math.min(0.45, 0.22 + priceWeight * 0.23)})\`);
        grad.addColorStop(0.70, \`rgba(0,0,0, \${Math.min(0.25, 0.10 + priceWeight * 0.15)})\`);
        grad.addColorStop(1.00, "rgba(0,0,0, 0)");

        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(x, y, r, 0, Math.PI * 2);
        offCtx.fill();
      });

      const imgData = offCtx.getImageData(0, 0, width, height);
      const pixels = imgData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha === 0) continue;
        const lutIdx = Math.min(255, Math.round((alpha / 210) * 255));
        const lutOffset = lutIdx * 4;
        pixels[i]     = PRICE_COLOR_LUT[lutOffset];
        pixels[i + 1] = PRICE_COLOR_LUT[lutOffset + 1];
        pixels[i + 2] = PRICE_COLOR_LUT[lutOffset + 2];
        pixels[i + 3] = PRICE_COLOR_LUT[lutOffset + 3];
      }

      const mainCtx = this.canvas.getContext("2d");
      if (mainCtx) {
        mainCtx.clearRect(0, 0, width, height);
        mainCtx.putImageData(imgData, 0, 0);
      }
    }
  };
}`;

if (html.includes(oldOverlayClassTarget)) {
  html = html.replace(oldOverlayClassTarget, newOverlayClassReplacement);
  console.log('✅ Replaced defineAreaPriceDensityOverlayClass with offscreen LUT renderer!');
} else {
  console.log('⚠️ Could not match exact target block');
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Patch complete!');
