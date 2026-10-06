const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

const oldBuildCircles = `function buildAreaPriceHoverCircles() {
  destroyAreaPriceHoverCircles();
  getVisibleAreaPricing().forEach((area) => {
    const circle = new google.maps.Circle({
      map, center: { lat: area.lat, lng: area.lng }, radius: 1000,
      fillOpacity: 0, strokeOpacity: 0, clickable: true, zIndex: 5,
    });
    circle.addListener("mouseover", (e) => {
      circle.setOptions({ fillOpacity: 0.12, fillColor: "#B68A4C", strokeOpacity: 0.6, strokeColor: "#B68A4C", strokeWeight: 2 });
      showAreaPriceHoverTip(area, e.domEvent);
    });
    circle.addListener("mousemove", (e) => moveAreaPriceHoverTip(e.domEvent));
    circle.addListener("mouseout", () => {
      circle.setOptions({ fillOpacity: 0, strokeOpacity: 0 });
      hideAreaPriceHoverTip();
    });
    circle.addListener("click", () => openPriceInsightCard(area));
    areaPriceHoverCircles.push(circle);
  });
}`;

const newBuildCircles = `function buildAreaPriceHoverCircles() {
  destroyAreaPriceHoverCircles();
  const points = typeof getVisibleAreaPricing === "function" ? getVisibleAreaPricing() : [];
  points.forEach((area) => {
    if (!area || typeof area.lat !== "number" || typeof area.lng !== "number") return;
    const price = area.avgPrice || 10500;
    let fillColor = "#48BB78";   // Soft Emerald (< ₹8k)
    let strokeColor = "#38A169";
    if (price >= 13000) {
      fillColor = "#E53E3E";     // Terracotta Red (≥ ₹13k)
      strokeColor = "#C53030";
    } else if (price >= 10500) {
      fillColor = "#ED8936";     // Soft Coral (₹10.5k - ₹13k)
      strokeColor = "#DD6B20";
    } else if (price >= 8000) {
      fillColor = "#ECC94B";     // Golden Yellow (₹8k - ₹10.5k)
      strokeColor = "#D69E2E";
    }

    const circle = new google.maps.Circle({
      map: map,
      center: { lat: area.lat, lng: area.lng },
      radius: 1800,
      fillColor: fillColor,
      fillOpacity: 0.38,
      strokeColor: strokeColor,
      strokeOpacity: 0.75,
      strokeWeight: 2,
      clickable: true,
      zIndex: 5,
    });

    circle.addListener("mouseover", (e) => {
      circle.setOptions({ fillOpacity: 0.60, strokeWeight: 3 });
      showAreaPriceHoverTip(area, e.domEvent);
    });
    circle.addListener("mousemove", (e) => moveAreaPriceHoverTip(e.domEvent));
    circle.addListener("mouseout", () => {
      circle.setOptions({ fillOpacity: 0.38, strokeWeight: 2 });
      hideAreaPriceHoverTip();
    });
    circle.addListener("click", () => openPriceInsightCard(area));
    areaPriceHoverCircles.push(circle);
  });
}`;

if (html.includes(oldBuildCircles)) {
  html = html.replace(oldBuildCircles, newBuildCircles);
  console.log('✅ Updated buildAreaPriceHoverCircles with native Google Maps vector price heatmap circles!');
} else {
  console.log('⚠️ Could not match exact oldBuildCircles');
}

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Native price heatmaps patch complete!');
