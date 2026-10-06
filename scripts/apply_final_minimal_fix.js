const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

// 1. Add CSS rules for .area-price-density-canvas
const oldCssTarget = `.tech-park-density-canvas--visible {
  opacity: 1;
}`;

const newCssReplacement = `.tech-park-density-canvas--visible {
  opacity: 1;
}

.area-price-density-canvas {
  position: absolute;
  pointer-events: none !important;
  opacity: 0;
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}
.area-price-density-canvas--visible {
  opacity: 1 !important;
}`;

if (html.includes(oldCssTarget) && !html.includes('.area-price-density-canvas {')) {
  html = html.replace(oldCssTarget, newCssReplacement);
  console.log('✅ Added CSS rules for .area-price-density-canvas');
}

// 2. Update defineAreaPriceDensityOverlayClass to use .area-price-density-canvas & robust direct rendering
const oldOverlayTarget = `function defineAreaPriceDensityOverlayClass() {
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

      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const zoom = gmap.getZoom() || 12;
      const baseRadius = Math.max(85, Math.min(160, (zoom - 9) * 28 + 85));

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        const x = pixel.x - sw.x; const y = pixel.y - ne.y;
        if (x < -baseRadius * 2 || x > width + baseRadius * 2 || y < -baseRadius * 2 || y > height + baseRadius * 2) return;

        const avgPrice = pt.avgPrice || 10500;
        const [r, g, b] = typeof colorForPrice === "function" ? colorForPrice(avgPrice) : [216, 124, 114];
        const rRadius = baseRadius;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, rRadius);
        grad.addColorStop(0.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.72)\`);
        grad.addColorStop(0.40, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.48)\`);
        grad.addColorStop(0.75, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.20)\`);
        grad.addColorStop(1.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)}, 0.00)\`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
}`;

const newOverlayReplacement = `function defineAreaPriceDensityOverlayClass() {
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

if (html.includes(oldOverlayTarget)) {
  html = html.replace(oldOverlayTarget, newOverlayReplacement);
  console.log('✅ Updated defineAreaPriceDensityOverlayClass with area-price-density-canvas class & no 0x0 return on bounds check');
} else {
  console.log('⚠️ Could not match oldOverlayTarget in step 2');
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Final minimal fix script complete!');
