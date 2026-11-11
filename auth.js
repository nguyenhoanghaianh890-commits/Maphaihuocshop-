/* ============================================
   VN ModStore — Authentication System (JWT)
   ============================================ */

const AUTH = {
  STORAGE_TOKEN: 'vnmodstore_token',
  STORAGE_USER: 'vnmodstore_user',

  /* ---------- Get Token ---------- */
  getToken() {
    return localStorage.getItem(this.STORAGE_TOKEN);
  },

  /* ---------- Get Current User ---------- */
  getCurrentUser() {
    try {
      const u = localStorage.getItem(this.STORAGE_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  /* ---------- Set Session ---------- */
  setSession(user, token) {
    if (user) localStorage.setItem(this.STORAGE_USER, JSON.stringify(user));
    if (token) localStorage.setItem(this.STORAGE_TOKEN, token);
  },

  /* ---------- Clear Session ---------- */
  clearSession() {
    localStorage.removeItem(this.STORAGE_TOKEN);
    localStorage.removeItem(this.STORAGE_USER);
  },

  /* ---------- Check Login Status ---------- */
  isLoggedIn() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  /* ---------- Check Admin Status ---------- */
  isAdmin() {
    const user = this.getCurrentUser();
    return this.isLoggedIn() && user && user.role === 'admin';
  },

  /* ---------- Register (via API) ---------- */
  async register(fullName, email, password, turnstileToken) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, turnstileToken })
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        this.setSession(data.user, data.token);
      }
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  },

  /* ---------- Login (via API) ---------- */
  async login(email, password, turnstileToken) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken })
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        this.setSession(data.user, data.token);
      }
      return data;
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  },

  /* ---------- Logout ---------- */
  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  /* ---------- Update User Sync ---------- */
  async syncUser() {
    if (!this.isLoggedIn()) return;
    try {
      const res = await fetch('/api/user/sync?_=' + Date.now(), {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });
      if (res.ok) {
        const user = await res.json();
        this.setSession(user, null); // update user data
        return user;
      } else {
        if (res.status === 401 || res.status === 403) {
          this.logout(); // Token expired or invalid
        }
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
  },
  
  /* ---------- Auth Fetch (Helper for APIs) ---------- */
  async authFetch(url, options = {}) {
    const token = this.getToken();
    if (!token) return fetch(url, options); // Not logged in

    const headers = { ...options.headers };
    headers['Authorization'] = `Bearer ${token}`;

    return fetch(url, { ...options, headers });
  },

  /* ---------- Update Navbar UI ---------- */
  updateNavbarAuth() {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;
    
    // Force container to full width to prevent shrinking
    navContainer.style.cssText = "width: 100% !important; box-sizing: border-box !important;";
    
    // Determine where to insert it (before nav-toggle if present)
    const navToggle = document.querySelector('.nav-toggle');
    
    // Remove existing if any
    let authSection = document.querySelector('.nav-auth');
    if (authSection) authSection.remove();
    
    authSection = document.createElement('div');
    authSection.className = 'nav-auth';
    
    // Force inline styles to bypass any CSS caching or specificity issues on mobile
    authSection.style.cssText = "margin-left: auto !important; display: flex; align-items: center; justify-content: flex-end;";
    
    if (!this.isLoggedIn()) {
      authSection.innerHTML = `<a href="login.html?v=15" class="btn btn-primary btn-sm nav-login-btn">Đăng Nhập</a>`;
      if (navToggle) navToggle.style.display = 'none';
    } else {
      if (navToggle) navToggle.style.display = '';
      const user = this.getCurrentUser();
      const isAdmin = user.role === 'admin';
      const balance = (user.balance || 0).toLocaleString('vi-VN');
      
      authSection.innerHTML = `
        <div class="nav-user-menu">
          <div class="nav-user-btn" onclick="this.nextElementSibling.classList.toggle('show')">
            <div class="nav-avatar">${user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</div>
            <span class="nav-username">${user.fullName || 'Người Dùng'}</span>
            <span class="nav-chevron">▼</span>
          </div>
          <div class="nav-dropdown">
            <div class="nav-dropdown-header">
              <div class="user-info-name">${user.fullName || 'Người Dùng'}</div>
              <div class="user-info-balance">Số dư: <span id="navBalance">${balance}</span> VNĐ</div>
            </div>
            ${isAdmin ? '<a href="admin.html" class="nav-dropdown-item"><span class="icon">⚙️</span> Quản Trị Hệ Thống</a>' : ''}
            <a href="#" onclick="if(typeof openPurchasesModal === 'function') openPurchasesModal(); return false;" class="nav-dropdown-item"><span class="icon">🛍️</span> Sản Phẩm Đã Mua</a>
            <a href="#" onclick="if(typeof openNaptienModal === 'function') openNaptienModal(); return false;" class="nav-dropdown-item"><span class="icon">💳</span> Nạp Tiền</a>
            <a href="#" onclick="AUTH.logout(); return false;" class="nav-dropdown-item logout-item"><span class="icon">🚪</span> Đăng Xuất</a>
          </div>
        </div>
      `;
    }
    
    if (navToggle) {
      navContainer.insertBefore(authSection, navToggle);
    } else {
      navContainer.appendChild(authSection);
    }
  },
  
  updateBalanceFromServer() {
    if (this.isLoggedIn()) {
      this.syncUser().then(u => {
        if (u) {
          const balEl = document.getElementById('navBalance');
          if (balEl) balEl.textContent = (u.balance || 0).toLocaleString('vi-VN');
          
          const modalBalEl = document.getElementById('userBalance');
          if (modalBalEl) modalBalEl.textContent = (u.balance || 0).toLocaleString('vi-VN');
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AUTH.updateNavbarAuth();
  AUTH.updateBalanceFromServer();
  
  // Auto sync balance every 10 seconds
  if (AUTH.isLoggedIn()) {
    setInterval(() => {
      AUTH.updateBalanceFromServer();
    }, 3000);
  }

  /* ========== Dynamic UI Settings ========== */
  (async function fetchUiSettings() {
    try {
      const res = await fetch('/api/ui-settings');
      if (res.ok) {
        const settings = await res.json();
        if (settings.announcement) document.getElementById('heroAnnouncement').innerHTML = settings.announcement;
        if (settings.heroTitle) document.getElementById('heroTitle').innerHTML = settings.heroTitle;
        if (settings.heroSubtitle) document.getElementById('heroSubtitle').innerHTML = settings.heroSubtitle;
      }
    } catch(e) {}
  })();
});
