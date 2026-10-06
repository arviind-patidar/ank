const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

// Replace defineAreaPriceDensityOverlayClass with the working, pristine implementation from commit b3a33a9
const cleanOverlayClass = `function defineAreaPriceDensityOverlayClass() {
  return class extends google.maps.OverlayView {
    constructor(gmap) { super(); this.canvas = null; this.points = []; this.setMap(gmap); }
    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = "2";
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
    setPoints(points) { this.points = points || []; this.draw(); }
    draw() {
      if (!this.canvas) return;
      const projection = this.getProjection(); if (!projection) return;
      const gmap = this.getMap(); if (!gmap) return;
      const bounds = gmap.getBounds();
      const pts = (this.points && this.points.length > 0) ? this.points : (typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : []);

      if (!bounds || !pts || pts.length === 0) {
        this.canvas.width = 0; this.canvas.height = 0;
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
      const radius = Math.max(80, Math.min(160, (zoom - 10) * 25 + 80));
      const peakAlpha = 0.65;

      pts.forEach((pt) => {
        if (!pt || typeof pt.lat !== "number" || typeof pt.lng !== "number" || isNaN(pt.lat) || isNaN(pt.lng)) return;
        const avgP = pt.avgPrice || 10500;
        const [r, g, b] = typeof colorForPrice === "function" ? colorForPrice(avgP) : [216, 124, 114];
        const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(pt.lat, pt.lng));
        if (!pixel) return;

        const x = pixel.x - minX;
        const y = pixel.y - minY;
        if (x < -radius * 2 || x > width + radius * 2 || y < -radius * 2 || y > height + radius * 2) return;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha})\`);
        grad.addColorStop(0.35, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha * 0.55})\`);
        grad.addColorStop(0.70, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},\${peakAlpha * 0.20})\`);
        grad.addColorStop(1.00, \`rgba(\${Math.round(r)},\${Math.round(g)},\${Math.round(b)},0)\`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (typeof updateAreaPricingDebugState === "function") updateAreaPricingDebugState();
    }
  };
}`;

const currentOverlayStart = html.indexOf('function defineAreaPriceDensityOverlayClass() {');
if (currentOverlayStart !== -1) {
  const currentOverlayEnd = html.indexOf('function showAreaPriceHeatmap() {', currentOverlayStart);
  if (currentOverlayEnd !== -1) {
    html = html.substring(0, currentOverlayStart) + cleanOverlayClass + '\n\n' + html.substring(currentOverlayEnd);
    console.log('✅ Replaced defineAreaPriceDensityOverlayClass with pristine b3a33a9 working implementation!');
  }
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Restore complete!');
