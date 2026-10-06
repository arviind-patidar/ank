const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

// 1. Re-add clean checkboxes in Map Layers & Insights accordion
const layersTarget = `          <label class="amenity-toggle" title="Show nearby malls">
            <input type="checkbox" id="filterMalls" checked />
            <span class="amenity-toggle__icon amenity-toggle__icon--mall" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="white"><path d="M7 8h10l1 11H6L7 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="white" stroke-width="1.6"/></svg>
            </span>
            <span class="amenity-toggle__text">Malls</span>
          </label>
        </div>`;

const layersReplacement = `          <label class="amenity-toggle" title="Show nearby malls">
            <input type="checkbox" id="filterMalls" checked />
            <span class="amenity-toggle__icon amenity-toggle__icon--mall" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="white"><path d="M7 8h10l1 11H6L7 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="white" stroke-width="1.6"/></svg>
            </span>
            <span class="amenity-toggle__text">Malls</span>
          </label>
        </div>

        <span class="sidebar-group-label" style="margin-top:12px; display:block;">Spatial Density Heatmaps</span>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
          <label class="field field--checkbox techpark-view-toggle" title="Show Tech Park Density Heatmap">
            <input type="checkbox" id="filterTechParkView" />
            <span class="field__label" style="font-weight:700;">Tech Park Density Heatmap</span>
          </label>
          <label class="field field--checkbox area-price-view-toggle" title="Show Area Price Density Heatmap">
            <input type="checkbox" id="filterAreaPriceView" />
            <span class="field__label" style="font-weight:700;">Area Price Density Heatmap</span>
          </label>
        </div>`;

if (html.includes(layersTarget) && !html.includes('filterTechParkView')) {
  html = html.replace(layersTarget, layersReplacement);
  console.log('✅ Re-added Tech Park Density & Price Density checkboxes to Map Layers accordion');
}

// 2. Safeguard JS references to els.techParkView, els.areaPriceView, and els.areaPriceViewNotice
html = html.replace(/els\.techParkView\.checked = false;/g, 'if (els.techParkView) els.techParkView.checked = false;');
html = html.replace(/els\.techParkView\.checked = true;/g, 'if (els.techParkView) els.techParkView.checked = true;');
html = html.replace(/els\.areaPriceView\.checked = false;/g, 'if (els.areaPriceView) els.areaPriceView.checked = false;');
html = html.replace(/els\.areaPriceView\.checked = true;/g, 'if (els.areaPriceView) els.areaPriceView.checked = true;');
html = html.replace(/els\.areaPriceViewNotice\.classList\.add/g, 'if (els.areaPriceViewNotice) els.areaPriceViewNotice.classList.add');
html = html.replace(/els\.areaPriceViewNotice\.classList\.remove/g, 'if (els.areaPriceViewNotice) els.areaPriceViewNotice.classList.remove');

html = html.replace(
  'els.techParkView.addEventListener("change", () => setTechParkViewMode(els.techParkView.checked));',
  'if (els.techParkView) els.techParkView.addEventListener("change", () => setTechParkViewMode(els.techParkView.checked));'
);

html = html.replace(
  'els.areaPriceView.addEventListener("change", () => setAreaPriceViewMode(els.areaPriceView.checked));',
  'if (els.areaPriceView) els.areaPriceView.addEventListener("change", () => setAreaPriceViewMode(els.areaPriceView.checked));'
);

fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
console.log('✅ Safeguarded all density heatmap JS calls successfully!');
