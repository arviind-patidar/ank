const fs = require('fs');

let html = fs.readFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', 'utf8');

const authScript = `
// ==================================================
// ACRE&KEY USER AUTHENTICATION & SESSION ARCHITECTURE
// ==================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const AuthService = {
  STORAGE_KEY: "ackey_user_session_v1",
  SHORTLIST_KEY: "ackey_user_shortlist_v1",
  
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  signup(userData) {
    const user = {
      id: "usr_" + Date.now(),
      name: userData.name || "Acre&Key User",
      phone: userData.phone || "",
      email: userData.email || "",
      purpose: userData.purpose || "End Use",
      createdAt: new Date().toISOString(),
      savedSearch: null
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.updateUI();
    return user;
  },

  login(identifier) {
    let user = this.getCurrentUser();
    if (!user) {
      user = {
        id: "usr_" + Date.now(),
        name: identifier.includes("@") ? identifier.split("@")[0] : identifier,
        email: identifier.includes("@") ? identifier : "",
        phone: !identifier.includes("@") ? identifier : "",
        purpose: "End Use",
        createdAt: new Date().toISOString(),
        savedSearch: null
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
    this.updateUI();
    return user;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    currentRequirementProfile = null;
    this.updateUI();
    showPublicLandingOverlay();
    applyFilters();
  },

  saveSearch(searchProfile) {
    const user = this.getCurrentUser();
    if (user) {
      user.savedSearch = searchProfile;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.updateUI();
    }
  },

  getShortlist() {
    try {
      const raw = localStorage.getItem(this.SHORTLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
  },

  toggleShortlist(projectId) {
    let list = this.getShortlist();
    const idx = list.indexOf(projectId);
    if (idx > -1) list.splice(idx, 1);
    else list.push(projectId);
    localStorage.setItem(this.SHORTLIST_KEY, JSON.stringify(list));
    this.updateUI();
    return list;
  },

  updateUI() {
    if (typeof updateUIForAuthState === "function") {
      updateUIForAuthState();
    }
  }
};

let pendingIntendedAction = null;

function gateAction(actionFn, actionDetails) {
  if (AuthService.isAuthenticated()) {
    if (typeof actionFn === "function") actionFn();
  } else {
    pendingIntendedAction = { fn: actionFn, details: actionDetails };
    openSignupModal();
  }
}

function onAuthSuccess() {
  updateUIForAuthState();
  closeSignupModal();
  closeLoginModal();
  closePublicLandingOverlay();

  if (pendingIntendedAction && typeof pendingIntendedAction.fn === "function") {
    const actionToRun = pendingIntendedAction.fn;
    pendingIntendedAction = null;
    actionToRun();
  }
}

function updateUIForAuthState() {
  const container = document.getElementById("topbarAuthContainer");
  const personalizeBanner = document.getElementById("personalizePromptBanner");
  const contextBar = document.getElementById("customerSearchContextBar");
  const shortlistBtn = document.getElementById("headerShortlistBtn");

  const user = AuthService.getCurrentUser();
  const shortlist = AuthService.getShortlist();

  if (user) {
    if (container) {
      container.innerHTML = \`
        <div class="user-menu-wrap">
          <button type="button" class="user-menu-btn" onclick="toggleUserDropdown(event)">
            <span>👤</span> <span>\${escapeHtml(user.name)}</span> <span style="font-size:9px;">▼</span>
          </button>
          <div class="user-dropdown-menu" id="userDropdownMenu" style="display:none;">
            <a href="javascript:void(0)" onclick="openUserProfileModal()">👤 My Profile</a>
            <a href="javascript:void(0)" onclick="openCustomerShortlistModal(true)">🔍 My Search</a>
            <a href="javascript:void(0)" onclick="openShortlistTray()">⭐ My Shortlist (\${shortlist.length})</a>
            <hr style="margin:4px 0; border:none; border-top:1px solid #2D3748;"/>
            <a href="javascript:void(0)" onclick="handleLogout()" style="color:#FEB2B2;">🚪 Log Out</a>
          </div>
        </div>
      \`;
    }

    if (user.savedSearch) {
      currentRequirementProfile = user.savedSearch;
      if (personalizeBanner) personalizeBanner.style.display = "none";
      if (contextBar) contextBar.style.display = "flex";
      
      const locStr = (currentRequirementProfile.preferred_locations || []).join(", ") || "Bengaluru";
      const cfgStr = (currentRequirementProfile.configuration || []).join(", ") || "Properties";
      const bgtStr = currentRequirementProfile.budget_flexible ? "Flexible Budget" : \`₹\${currentRequirementProfile.budget_min}L–\${currentRequirementProfile.budget_max}L\`;
      const summaryText = document.getElementById("customerSearchSummaryText");
      if (summaryText) summaryText.textContent = \`\${cfgStr} · \${bgtStr} · \${locStr}\`;
    } else {
      if (personalizeBanner) personalizeBanner.style.display = "flex";
      if (contextBar) contextBar.style.display = "none";
    }
    if (shortlistBtn) shortlistBtn.style.display = "inline-flex";
  } else {
    if (container) {
      container.innerHTML = \`
        <button type="button" class="btn-auth-nav" onclick="openSignupModal()">SIGN UP</button>
        <button type="button" class="btn-auth-nav btn-auth-nav--outline" onclick="openLoginModal()">LOG IN</button>
      \`;
    }
    if (personalizeBanner) personalizeBanner.style.display = "none";
    if (contextBar) contextBar.style.display = "none";
  }
}

function showPublicLandingOverlay() {
  const overlay = document.getElementById("publicLandingOverlay");
  if (overlay) overlay.style.display = "flex";
}

function closePublicLandingOverlay() {
  const overlay = document.getElementById("publicLandingOverlay");
  if (overlay) overlay.style.display = "none";
}

function openSignupModal() {
  closeLoginModal();
  const modal = document.getElementById("signupModal");
  if (modal) modal.classList.add("active");
}

function closeSignupModal() {
  const modal = document.getElementById("signupModal");
  if (modal) modal.classList.remove("active");
}

function openLoginModal() {
  closeSignupModal();
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("active");
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("active");
}

function openSignupFromLogin() {
  closeLoginModal();
  openSignupModal();
}

function openLoginFromSignup() {
  closeSignupModal();
  openLoginModal();
}

function handleSignupSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("signupName")?.value.trim() || "Acre&Key User";
  const phone = document.getElementById("signupPhone")?.value.trim() || "";
  const email = document.getElementById("signupEmail")?.value.trim() || "";
  const purpose = document.getElementById("signupPurpose")?.value || "End Use";

  AuthService.signup({ name, phone, email, purpose });
  onAuthSuccess();
}

function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const identifier = document.getElementById("loginIdentifier")?.value.trim() || "Acre&Key User";
  AuthService.login(identifier);
  onAuthSuccess();
}

function handleLogout() {
  AuthService.logout();
  closeUserProfileModal();
}

function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("userDropdownMenu");
  if (menu) menu.style.display = menu.style.display === "none" ? "block" : "none";
}

document.addEventListener("click", () => {
  const menu = document.getElementById("userDropdownMenu");
  if (menu) menu.style.display = "none";
});

function openUserProfileModal() {
  const user = AuthService.getCurrentUser();
  if (!user) return;
  const body = document.getElementById("userProfileModalBody");
  if (body) {
    body.innerHTML = \`
      <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; color:#2D3748;">
        <div><strong style="color:#718096; font-size:10px; letter-spacing:0.05em;">FULL NAME</strong><br/><span style="font-weight:700; font-size:15px; color:#1A202C;">\${escapeHtml(user.name)}</span></div>
        <div><strong style="color:#718096; font-size:10px; letter-spacing:0.05em;">WHATSAPP / PHONE</strong><br/>\${escapeHtml(user.phone || 'Not specified')}</div>
        <div><strong style="color:#718096; font-size:10px; letter-spacing:0.05em;">EMAIL ADDRESS</strong><br/>\${escapeHtml(user.email || 'Not specified')}</div>
        <div><strong style="color:#718096; font-size:10px; letter-spacing:0.05em;">PURPOSE</strong><br/>\${escapeHtml(user.purpose || 'End Use')}</div>
        <div><strong style="color:#718096; font-size:10px; letter-spacing:0.05em;">MEMBER SINCE</strong><br/>\${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
      </div>
    \`;
  }
  const modal = document.getElementById("userProfileModal");
  if (modal) modal.classList.add("active");
}

function closeUserProfileModal() {
  const modal = document.getElementById("userProfileModal");
  if (modal) modal.classList.remove("active");
}

function openShortlistTray() {
  const shortlistIds = AuthService.getShortlist();
  const body = document.getElementById("shortlistTrayBody");
  if (body) {
    if (shortlistIds.length === 0) {
      body.innerHTML = \`<div style="text-align:center; padding:30px; color:#718096; font-size:13px;">You have not shortlisted any projects yet.<br/><br/><button class="modal-btn modal-btn--next" style="background:var(--gold); color:#12202E;" onclick="closeShortlistTray()">EXPLORE MAP PROJECTS</button></div>\`;
    } else {
      const items = shortlistIds.map(id => ALL_PROPERTIES.find(p => p.id === id)).filter(Boolean);
      body.innerHTML = items.map(p => \`
        <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid #E2E8F0; padding:10px 12px; border-radius:6px; margin-bottom:8px;">
          <div>
            <div style="font-weight:700; color:#1A202C; font-size:13px;">\${escapeHtml(p.title)}</div>
            <div style="font-size:11px; color:#718096;">\${escapeHtml(p.locality)} · \${escapeHtml(p.bhk || '')} · \${escapeHtml(p.priceRange || '')}</div>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" style="background:var(--gold); color:#12202E; border:none; border-radius:4px; padding:4px 8px; font-weight:700; font-size:11px; cursor:pointer;" onclick="closeShortlistTray(); setActive('\${p.id}');">VIEW</button>
            <button type="button" style="background:#FFF; color:#E53E3E; border:1px solid #FEB2B2; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;" onclick="toggleProjectShortlist('\${p.id}'); openShortlistTray();">✕</button>
          </div>
        </div>
      \`).join('');
    }
  }
  const modal = document.getElementById("shortlistTrayModal");
  if (modal) modal.classList.add("active");
}

function closeShortlistTray() {
  const modal = document.getElementById("shortlistTrayModal");
  if (modal) modal.classList.remove("active");
}

function openCompareTrayFromShortlist() {
  closeShortlistTray();
  openCompareTray();
}

function toggleProjectShortlist(projectId) {
  if (!AuthService.isAuthenticated()) {
    gateAction(() => toggleProjectShortlist(projectId));
    return;
  }
  AuthService.toggleShortlist(projectId);
  if (popupCache && popupCache.id === projectId) {
    renderDetailPanel(popupCache);
  }
}
`;

if (!html.includes('AuthService =')) {
  html = html.replace('function initAppListings() {\n  DataService.loadApplicationData();\n}', 'function initAppListings() {\n  DataService.loadApplicationData();\n}\n' + authScript);
  fs.writeFileSync('/Users/patidar/Desktop/Ank Map V3/index.html', html, 'utf8');
  console.log('✅ Integrated AuthService block successfully!');
} else {
  console.log('AuthService block already present!');
}
