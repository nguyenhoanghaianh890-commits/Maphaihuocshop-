/* ============================================
   VN ModStore — Main JavaScript
   ============================================ */

// --- Hệ thống bảo mật: Chống F12, Chống Chuột Phải, Chống trích xuất dữ liệu ---
(function() {
  const isAdmin = window.location.pathname.includes('admin') || (function() {
    try {
      const u = localStorage.getItem('user');
      return u && JSON.parse(u).role === 'admin';
    } catch(e) { return false; }
  })();

  if (!isAdmin) {
    // 1. Chặn phím tắt kiểm tra trang (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
    window.addEventListener('keydown', function(e) {
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault(); e.stopPropagation();
        showBlockedNotice('F12 (DevTools) đã bị vô hiệu hóa.');
        return false;
      }
      const isCmd = e.ctrlKey || e.metaKey;
      if (isCmd && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault(); e.stopPropagation();
        showBlockedNotice('Phím tắt kiểm tra trang đã bị vô hiệu hóa.');
        return false;
      }
      if (isCmd && (e.keyCode === 85 || e.key === 'u' || e.key === 'U')) {
        e.preventDefault(); e.stopPropagation();
        showBlockedNotice('Xem mã nguồn trang đã bị vô hiệu hóa.');
        return false;
      }
      if (isCmd && (e.keyCode === 83 || e.key === 's' || e.key === 'S')) {
        e.preventDefault(); e.stopPropagation();
        return false;
      }
    }, true);

    // 2. Chặn chuột phải (Context Menu)
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      showBlockedNotice('Chuột phải đã bị vô hiệu hóa trên hệ thống.');
      return false;
    }, true);

    // 3. Làm sạch Console & chặn ghi log dữ liệu
    try {
      setInterval(() => console.clear(), 1500);
      const noop = function() {};
      console.log = noop;
      console.warn = noop;
      console.info = noop;
      console.table = noop;
      console.dir = noop;
    } catch(e) {}

    // 4. Bẫy Debugger khi DevTools mở
    setInterval(function() {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        (function() { return false; }['constructor']('debugger')['call']());
      }
    }, 1000);
  }

  let toastTimeout = null;
  function showBlockedNotice(msg) {
    let toast = document.getElementById('security-blocked-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'security-blocked-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(15,17,26,0.95);color:#ff5252;padding:12px 24px;border-radius:30px;font-size:0.9rem;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 15px rgba(255,82,82,0.3);border:1px solid rgba(255,82,82,0.4);z-index:9999999;pointer-events:none;opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:8px;font-family:system-ui,-apple-system,sans-serif;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span style="font-size:1.2rem;">🛡️</span> <span>' + msg + '</span>';
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }
})();


window.toggleCustomSelect = function(el) {
  const container = el.parentElement;
  const options = container.querySelector('.custom-options-ui');
  const svg = el.querySelector('svg');
  const card = el.closest('.product-card');
  
  // Close all other open dropdowns
  document.querySelectorAll('.custom-options-ui').forEach(opt => {
    if (opt !== options) {
      opt.style.display = 'none';
      if(opt.parentElement.querySelector('svg')) opt.parentElement.querySelector('svg').style.transform = 'rotate(0deg)';
      if(opt.parentElement.querySelector('.custom-select-ui')) opt.parentElement.querySelector('.custom-select-ui').classList.remove('active');
      const otherCard = opt.closest('.product-card');
      if (otherCard) otherCard.style.zIndex = '';
    }
  });

  if (options.style.display === 'none' || !options.style.display) {
    if (card) card.style.zIndex = '50';
    options.style.display = 'block';
    svg.style.transform = 'rotate(180deg)';
    el.classList.add('active');
  } else {
    if (card) card.style.zIndex = '';
    options.style.display = 'none';
    svg.style.transform = 'rotate(0deg)';
    el.classList.remove('active');
  }
};

window.selectCustomOption = function(el, selectId, text, price, name, value, event) {
  const container = el.closest('.custom-dropdown-container');
  const select = document.getElementById(selectId);
  const triggerText = container.querySelector('.custom-select-trigger-text');
  const optionsUi = container.querySelector('.custom-options-ui');
  const svg = container.querySelector('svg');
  const selectUi = container.querySelector('.custom-select-ui');
  const card = container.closest('.product-card');
  
  triggerText.innerHTML = text;
  
  const index = Array.from(el.parentElement.children).indexOf(el);
  select.selectedIndex = index;
  
  select.dispatchEvent(new Event('change'));
  
  optionsUi.style.display = 'none';
  svg.style.transform = 'rotate(0deg)';
  selectUi.classList.remove('active');
  if (card) card.style.zIndex = '';
  
  if (event) event.stopPropagation();
};

document.addEventListener('click', function(event) {
  if (!event.target.closest('.custom-dropdown-container')) {
    document.querySelectorAll('.custom-options-ui').forEach(opt => {
      opt.style.display = 'none';
      if (opt.parentElement.querySelector('svg')) {
        opt.parentElement.querySelector('svg').style.transform = 'rotate(0deg)';
      }
      if (opt.parentElement.querySelector('.custom-select-ui')) {
        opt.parentElement.querySelector('.custom-select-ui').classList.remove('active');
      }
      const card = opt.closest('.product-card');
      if (card) card.style.zIndex = '';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initAnimatedCounters();
  initProductFiltering();
  initSmoothScroll();
  initParticles();
  fetchAndRenderProducts();
});

/* ---------- Navbar Scroll Effect ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Scroll Animations (Intersection Observer) ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ---------- Animated Counters ---------- */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-counter'));
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    
    element.textContent = prefix + current.toLocaleString() + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---------- Product Filtering ---------- */
function initProductFiltering() {
  const filterTabs = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('.filter-search input');
  const productCards = document.querySelectorAll('.product-card');

  if (filterTabs.length === 0 || productCards.length === 0) return;

  // Tab filtering
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.getAttribute('data-filter');
      filterProducts(filter, searchInput ? searchInput.value : '');
    });
  });

  // Search filtering
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const activeTab = document.querySelector('.filter-btn.active');
        const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        filterProducts(filter, searchInput.value);
      }, 300);
    });
  }
}

function filterProducts(category, searchTerm) {
  const grid = document.querySelector('.products-grid');
  const productCards = document.querySelectorAll('.product-card');
  searchTerm = searchTerm.toLowerCase().trim();

  // Smooth fade out
  if (grid) {
    grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    grid.style.opacity = '0';
    grid.style.transform = 'scale(0.98)';
  }

  setTimeout(() => {
    productCards.forEach((card, index) => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardName = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();

      const matchesCategory = category === 'all' || cardCategory === category;
      const matchesSearch = !searchTerm || cardName.includes(searchTerm) || cardDesc.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        card.style.animation = 'none'; // Prevent conflict with grid fade
      } else {
        card.style.display = 'none';
      }
    });

    // Smooth fade in
    if (grid) {
      grid.style.opacity = '1';
      grid.style.transform = 'scale(1)';
    }
  }, 300);
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ---------- Additional Particles ---------- */
let canvasAnimId;
function initParticles(settings = {}) {
  const container = document.querySelector('.particles');
  if (!container) return;
  
  if (canvasAnimId) { cancelAnimationFrame(canvasAnimId); }
  const effect = settings.fallingEffect || 'snow';
  if (effect === 'none') { container.style.display = 'none'; return; }
  
  container.style.display = 'block';
  container.innerHTML = '<canvas id="particle-canvas" style="width: 100%; height: 100%; display: block;"></canvas>';
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { 
    w = canvas.width = window.innerWidth; 
    h = canvas.height = window.innerHeight; 
  });
  
  const count = parseInt(settings.effectCount) || (effect === 'matrix' ? 30 : 50);
  const color = settings.effectColor || '#ffffff';
  // Adjust speed: smaller speed value means faster in original DOM, so we invert it for velocity
  const speedVal = parseInt(settings.effectSpeed) || 10;
  const size = parseInt(settings.effectSize) || 5;
  
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      s: (Math.random() + 0.5) * size,
      v: (Math.random() * 2 + 1) * (15 / speedVal),
      a: Math.random() * Math.PI * 2,
      char: String.fromCharCode(0x30A0 + Math.random() * 96)
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    
    if (effect === 'matrix') { 
      ctx.fillStyle = color === '#ffffff' ? '#0f0' : color; 
      ctx.font = size * 3 + 'px monospace'; 
    } else if (effect === 'money') {
      ctx.font = size * 2 + 'px Arial';
    }

    particles.forEach(p => {
      if (effect === 'snow' || effect === 'sakura') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect === 'matrix') {
        ctx.fillText(p.char, p.x, p.y);
      } else if (effect === 'money') {
        ctx.fillText('$', p.x, p.y);
      }
      p.y += p.v;
      p.x += Math.sin(p.a) * 0.5;
      
      // Matrix char change
      if (effect === 'matrix' && Math.random() < 0.1) {
        p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
      }

      if (p.y > h) { 
        p.y = -20; 
        p.x = Math.random() * w; 
      }
    });
    canvasAnimId = requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- Purchase Logic ---------- */
const PRODUCT_PRICES = {
  'Mod Menu Free Fire APK': 150000,
  'Mod Menu GTA V PC': 300000,
  'Hack Roblox APK': 120000,
  'Hack Valorant PC': 350000,
  'Mod Menu Free Fire iOS': 200000,
  'Mod Menu Stumble Guys APK': 100000,
  'Mod Menu Stumble Guys iOS': 100000,
  'Mod Menu PUBG Mobile APK': 250000,
  'Mod Menu PUBG Mobile iOS': 250000,
  'Hack Roblox iOS': 150000,
  'Mod Menu CS2 PC': 200000,
  'Hack Fortnite PC': 250000,
};

function openContact(productId, productName, pkgId, pkgName, pkgPrice) {
  const product = GLOBAL_PRODUCTS.find(x => x.id === productId || x.name === productName);
  if (!product) return;

  if (typeof AUTH === 'undefined' || !AUTH.isLoggedIn()) {
    alert('Vui lòng đăng nhập để mua sản phẩm.');
    window.location.href = 'login.html';
    return;
  }

  const user = AUTH.getCurrentUser();
  const isSeller = user.role === 'seller';
  const discount = user.discount || 0;

  // Fallback if no packages
  let packages = product.packages || [];
  if (packages.length === 0) {
    let oldPrice = parseInt((product.price || '').toString().replace(/[^0-9]/g, '')) * 1000;
    if (isNaN(oldPrice) || oldPrice <= 0) oldPrice = 150000;
    packages = [{ id: 'default', name: 'Mặc định', price: oldPrice, active: true }];
  }
  
  // Filter active packages
  packages = packages.filter(p => p.active !== false);

  if (packages.length === 0) {
    alert('Sản phẩm này hiện chưa có gói dịch vụ nào!');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  
  let finalPrice = pkgPrice || packages[0].price;
  if (!pkgPrice && isSeller && discount > 0) {
    finalPrice = packages[0].price * (100 - discount) / 100;
  }
  
  const selectedPkgName = pkgName || packages[0].name;
  const selectedPkgId = pkgId || packages[0].id || packages[0].name;

  modal.innerHTML = `
    <div class="contact-modal-overlay"></div>
    <div class="contact-modal-content" style="max-width: 400px;">
      <button class="contact-modal-close">&times;</button>
      <h3 style="margin-bottom:20px; font-size: 1.2rem;">Xác nhận mua hàng</h3>
      
      <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
        <div style="margin-bottom: 8px; font-size: 1rem; font-weight: 600; color: #fff;">${product.name}</div>
        <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 4px;">Gói dịch vụ: <span style="color: #a855f7; font-weight: 600;">${selectedPkgName}</span></div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem;">
        <span style="color: var(--text-muted)">Thanh toán</span>
        <strong style="color: #10b981; font-size: 1.1rem;">${finalPrice.toLocaleString()}đ</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 0.9rem;">
        <span style="color: var(--text-muted)">Số dư của bạn</span>
        <strong style="color: #60a5fa;">${(user.balance || 0).toLocaleString()}đ</strong>
      </div>
      
      <div id="buyErrorMsg" style="color: #ef4444; font-size: 0.9rem; margin-bottom: 15px; display: none;"></div>

      <button id="btnConfirmBuy" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700;">🛒 MUA NGAY</button>
    </div>
  `;


  if (!document.querySelector('#contact-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'contact-modal-styles';
    styles.textContent = `
      .contact-modal { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out; }
      .contact-modal-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); }
      .contact-modal-content { position: relative; background: linear-gradient(145deg, rgba(20, 20, 35, 0.95), rgba(10, 10, 20, 0.98)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; max-width: 440px; width: 92%; text-align: center; animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124, 58, 237, 0.15); }
      .contact-modal-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
      .contact-modal-close:hover { color: var(--text-primary); }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(modal);

  modal.querySelector('.contact-modal-overlay').addEventListener('click', () => modal.remove());
  modal.querySelector('.contact-modal-close').addEventListener('click', () => modal.remove());
  
  modal.querySelector('#btnConfirmBuy').addEventListener('click', () => {
    confirmPurchase(product.id, product.name, selectedPkgId, selectedPkgName);
  });
}

async function confirmPurchase(productId, productName, packageId, packageName) {
  const modal = document.querySelector('.contact-modal');
  const btn = document.getElementById('btnConfirmBuy');
  const msg = document.getElementById('buyErrorMsg');
  const user = AUTH.getCurrentUser();
  
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  msg.style.display = 'none';

  try {
    const res = await AUTH.authFetch('/api/user/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, packageId })
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      const product = typeof GLOBAL_PRODUCTS !== 'undefined' ? GLOBAL_PRODUCTS.find(p => p.id === productId) : null;
      const dlLink = (product && product.downloadLink) ? product.downloadLink : '#';
      const dlAction = dlLink !== '#' ? `window.open('${dlLink.replace(/'/g, "\\'")}', '_blank'); return false;` : `alert('Sản phẩm này chưa có link tải hoặc đang được cập nhật...'); return false;`;

      let keyHtml = '';
      if (data.key) {
        keyHtml = `
          <div style="background: rgba(168, 85, 247, 0.05); padding: 16px; border-radius: 8px; border: 1px dashed rgba(168, 85, 247, 0.5); margin-bottom: 20px; text-align: left;">
            <div style="font-size: 0.9rem; color: #c084fc; margin-bottom: 12px; font-weight: 500;">🔑 Key của bạn:</div>
            <div style="display: flex; gap: 8px; align-items: stretch;">
              <code style="flex: 1; display: flex; align-items: center; background: rgba(0, 0, 0, 0.4); padding: 0 16px; border-radius: 8px; color: #fff; font-size: 1.1rem; letter-spacing: 1px; user-select: all; cursor: text; border: 1px solid rgba(255, 255, 255, 0.05); margin: 0; min-height: 44px;">${data.key}</code>
              <button style="padding: 0 20px; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: none; border-radius: 8px; font-weight: bold; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; min-height: 44px; display: flex; align-items: center; justify-content: center;" onclick="navigator.clipboard.writeText('${data.key}'); const btn = this; const oldText = btn.textContent; btn.textContent = 'Đã Copy!'; setTimeout(() => btn.textContent = oldText, 2000);" onmouseover="this.style.background='rgba(168, 85, 247, 0.3)'" onmouseout="this.style.background='rgba(168, 85, 247, 0.2)'">Copy</button>
            </div>
          </div>
        `;
      }

      document.querySelector('.contact-modal-content').innerHTML = `
        <h3 style="margin-bottom:10px; color:#34d399;">✅ Mua thành công!</h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">Cảm ơn bạn đã mua <strong>${productName} (${packageName})</strong>.</p>
        ${keyHtml}
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="this.closest('.contact-modal').remove(); if(typeof openPurchasesModal === 'function') openPurchasesModal();">Xem Đơn Hàng</button>
          <button class="btn btn-primary" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);" onclick="${dlAction}">📥 Tải Về Mới Nhất</button>
        </div>
      `;
      AUTH.updateBalanceFromServer();
    } else {
      if (data.error === 'Không đủ số dư' || data.error === 'Insufficient balance') {
        msg.innerHTML = '❌ Số dư không đủ. <a href="#" onclick="this.closest(\'.contact-modal\').remove(); if(typeof openNaptienModal===\'function\') openNaptienModal(); else window.location.href=\'index.html?naptien=true\'; return false;" style="color:#34d399; text-decoration:underline;">Nạp tiền ngay</a>';
      } else {
        msg.textContent = '❌ Lỗi: ' + data.error;
      }
      msg.style.display = 'block';
      btn.disabled = false;
      btn.textContent = '🛒 MUA NGAY';
    }
  } catch(e) {
    msg.textContent = '❌ Lỗi kết nối máy chủ.';
    msg.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '🛒 MUA NGAY';
  }
}

/* ---------- View Purchases ---------- */
async function openPurchasesModal() {
  if (typeof AUTH === 'undefined' || !AUTH.isLoggedIn()) return;
  const user = AUTH.getCurrentUser();

  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  modal.innerHTML = `
    <div class="contact-modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="contact-modal-content" style="max-width: 500px;">
      <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
      <h3 style="margin-bottom:20px; color:#a78bfa;">🛍️ Sản Phẩm Đã Mua</h3>
      <div id="purchasesList" style="max-height: 60vh; overflow-y: auto; text-align: left;">
        <p style="text-align: center; color: #888;">Đang tải dữ liệu...</p>
      </div>
    </div>
  `;
  if (!document.querySelector('#contact-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'contact-modal-styles';
    styles.textContent = `
      .contact-modal { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out; }
      .contact-modal-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); }
      .contact-modal-content { position: relative; background: linear-gradient(145deg, rgba(20, 20, 35, 0.95), rgba(10, 10, 20, 0.98)); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; max-width: 440px; width: 92%; text-align: center; animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124, 58, 237, 0.15); }
      .contact-modal-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
      .contact-modal-close:hover { color: var(--text-primary); }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(modal);

  try {
    const res = await AUTH.authFetch(`/api/user/sync`);
    const data = await res.json();
    const list = document.getElementById('purchasesList');
    
    if (!data.purchases || data.purchases.length === 0) {
      list.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Bạn chưa mua sản phẩm nào.</p>';
      return;
    }

    list.innerHTML = data.purchases.reverse().map(p => {
      if (!p) return '';
      let product = null;
      if (typeof GLOBAL_PRODUCTS !== 'undefined') {
        if (p.productId) {
          product = GLOBAL_PRODUCTS.find(x => x.id === p.productId);
        } else if (p.productName) {
          // Fallback for old purchases
          product = GLOBAL_PRODUCTS.find(x => x.name && p.productName.startsWith(x.name));
        }
      }
      
      const dlLink = (product && product.downloadLink) ? product.downloadLink : '#';
      const dlAction = dlLink !== '#' ? `window.open('${dlLink.replace(/'/g, "\\'")}', '_blank'); return false;` : `alert('Sản phẩm này chưa có link tải hoặc đang được cập nhật...'); return false;`;

      return `
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <h4 style="margin: 0 0 8px 0; color: #fff;">${p.productName}</h4>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #aaa;">
          <span>Giá: <strong style="color: #34d399;">${(p.price || 0).toLocaleString()}đ</strong></span>
          <span>${p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('vi-VN') : ''}</span>
        </div>
        ${p.key ? `
        <div style="margin-top: 12px; background: rgba(168, 85, 247, 0.1); border: 1px dashed rgba(168, 85, 247, 0.5); padding: 10px; border-radius: 8px;">
          <div style="font-size: 0.85rem; color: #a855f7; margin-bottom: 4px;">🔑 Key của bạn:</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" value="${p.key.replace(/"/g, '&quot;')}" readonly style="flex: 1; background: rgba(0,0,0,0.3); border: none; color: #fff; padding: 6px 10px; border-radius: 6px; font-family: monospace; font-size: 0.95rem;">
            <button class="btn btn-sm" style="background: rgba(168,85,247,0.2); color: #c084fc; padding: 6px 12px; font-size: 0.85rem;" onclick="navigator.clipboard.writeText('${p.key.replace(/'/g, "\\'")}').then(() => alert('Đã sao chép Key!'))">Copy</button>
          </div>
        </div>
        ` : ''}
        <div style="margin-top: 12px;">
          <a href="#" onclick="${dlAction}" style="display: inline-block; padding: 6px 12px; background: rgba(96,165,250,0.2); color: #60a5fa; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(96,165,250,0.3)'" onmouseout="this.style.background='rgba(96,165,250,0.2)'">📥 Tải Xuống Script/App</a>
        </div>
      </div>
      `;
    }).join('');
  } catch(e) {
    console.error('Error fetching purchases:', e);
    const list = document.getElementById('purchasesList');
    if (list) list.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">Lỗi tải dữ liệu.</p>';
  }
}

// Apply UI settings
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/ui-settings');
    if (res.ok) {
      const settings = await res.json();
      
      // Update Hero texts if on homepage
      const ann = document.getElementById('heroAnnouncement');
      const title = document.getElementById('heroTitle');
      const sub = document.getElementById('heroSubtitle');
      
      if (ann && settings.announcement) ann.textContent = settings.announcement;
      if (title && settings.heroTitle) title.innerHTML = settings.heroTitle;
      if (sub && settings.heroSubtitle) sub.textContent = settings.heroSubtitle;
      
      // Init particles with settings
      initParticles(settings);
    } else {
      // Init default particles
      initParticles({});
    }
  } catch(e) {
    initParticles({});
  }
});


/* ---------- Dynamic Products Rendering ---------- */
let GLOBAL_PRODUCTS = [];

async function fetchAndRenderProducts() {
  // Use SSR injected data if available for INSTANT load
  if (window.INITIAL_PRODUCTS && window.INITIAL_PRODUCTS.length > 0) {
    GLOBAL_PRODUCTS = window.INITIAL_PRODUCTS;
    renderProductsToGrid();
  } else {
    // Try to load from cache first for instant display
    try {
      const cached = localStorage.getItem('productsCache');
      if (cached) {
        GLOBAL_PRODUCTS = JSON.parse(cached);
        renderProductsToGrid();
      }
    } catch (e) {}
  }

  // Fetch fresh data in background
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const newData = await res.json();
      // Only re-render if data actually changed to avoid flickering
      if (JSON.stringify(newData) !== JSON.stringify(GLOBAL_PRODUCTS)) {
        GLOBAL_PRODUCTS = newData;
        localStorage.setItem('productsCache', JSON.stringify(GLOBAL_PRODUCTS));
        renderProductsToGrid();
      }
    }
  } catch (e) {
    console.error('Failed to load products', e);
  }

  // If we still have no products, try rendering anyway to show empty state/errors
  if (GLOBAL_PRODUCTS.length === 0) {
    try {
      renderProductsToGrid();
    } catch (err) {
      const grid = document.querySelector('.products-grid');
      if (grid) grid.innerHTML = `<p style="color: red; padding: 20px;">Lỗi hiển thị sản phẩm: ${err.message}</p>`;
    }
  }
}

function renderProductsToGrid() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  
  // Determine if we need to filter by a specific platform based on the page
  let pageFilter = 'all';
  if (window.location.pathname.includes('ios.html')) pageFilter = 'ios';
  else if (window.location.pathname.includes('android.html')) pageFilter = 'android';
  else if (window.location.pathname.includes('pc.html')) pageFilter = 'pc';

  let html = '';
  
  const displayProducts = GLOBAL_PRODUCTS.filter(p => pageFilter === 'all' || p.platform === pageFilter);
  
  if (displayProducts.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); width: 100%;">Hiện chưa có sản phẩm nào.</p>';
    return;
  }

  const user = (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) ? AUTH.getCurrentUser() : null;

  displayProducts.forEach((p, index) => {
    // Generate feature list
    let featuresHtml = '';
    if (p.features && p.features.length > 0) {
      featuresHtml = p.features.map(f => `<p class="card-desc" style="margin-bottom: 4px;"><span class="verified-tick"></span> ${f}</p>`).join('');
    } else if (p.desc) {
      featuresHtml = `<p class="card-desc"><span class="verified-tick"></span> ${p.desc}</p>`;
    }
    
    // Generate packages HTML
    let packages = p.packages || [];
    if (packages.length === 0) {
      let numStr = (p.price || '').toString().replace(/[^0-9]/g, '');
      let oldPrice = parseInt(numStr) || 0;
      if (oldPrice < 1000 && oldPrice > 0) oldPrice = oldPrice * 1000;
      if (isNaN(oldPrice) || oldPrice <= 0) oldPrice = 150000;
      packages = [{ id: 'default', name: 'Mặc định', price: oldPrice, active: true }];
    }
    
    // Clean up package names (remove "1 - ", "2 - ", etc.)
    packages = packages.map(pkg => {
      let cleanName = pkg.name;
      if (typeof cleanName === 'string') {
        cleanName = cleanName.replace(/^\d+\s*-\s*/, '');
      }
      return { ...pkg, name: cleanName };
    });

    packages = packages.filter(pkg => pkg.active !== false);

    let packagesHtml = '';
    if (packages.length > 1) {
      const selectId = 'pkg-select-' + Math.random().toString(36).substr(2, 9);
      let firstPrice = packages[0].price;
      
      packagesHtml = `
        <div class="custom-dropdown-container">
          <select id="${selectId}" class="pkg-select" style="display: none;">
            ${packages.map((pkg, i) => {
              let finalPrice = pkg.price;
              return `<option value="${pkg.id || pkg.name}" data-price="${finalPrice}" data-name="${pkg.name}">${pkg.name} - ${finalPrice.toLocaleString('vi-VN')}đ</option>`;
            }).join('')}
          </select>
          
          <div class="custom-select-ui" onclick="toggleCustomSelect(this)">
             <span class="custom-select-trigger-text">${packages[0].name} - <span style="color: var(--accent-primary-light); font-weight: 600;">${firstPrice.toLocaleString('vi-VN')}đ</span></span>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.3s;"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          
          <div class="custom-options-ui">
             ${packages.map((pkg, i) => {
               let finalPrice = pkg.price;
               return `<div class="custom-option-item" onclick="selectCustomOption(this, '${selectId}', '${pkg.name} - <span style=\\'color: var(--accent-primary-light); font-weight: 600;\\'>${finalPrice.toLocaleString('vi-VN')}đ</span>', ${finalPrice}, '${pkg.name}', '${pkg.id || pkg.name}', event)">
                 ${pkg.name} - <span style="color: var(--accent-primary-light); font-weight: 600; margin-left: 4px;">${finalPrice.toLocaleString('vi-VN')}đ</span>
               </div>`;
             }).join('')}
          </div>
        </div>
      `;
    } else if (packages.length === 1) {
      let finalPrice = packages[0].price;
      const numPrice = parseInt((p.price || '').toString().replace(/[^0-9]/g, '')) || 0;
      const adjustedMainPrice = (numPrice > 0 && numPrice < 1000) ? numPrice * 1000 : numPrice;
      if (adjustedMainPrice > 0 && (finalPrice === 0 || packages[0].name === 'Mặc định' || finalPrice !== adjustedMainPrice)) {
        finalPrice = adjustedMainPrice;
        packages[0].price = finalPrice;
      }

      packagesHtml = `<input type="hidden" class="pkg-select" value="${packages[0].id || packages[0].name}" data-price="${finalPrice}" data-name="${packages[0].name}">`;
    }
    
    // Platform icons and names
    const platName = p.platform === 'ios' ? '📱 iOS' : p.platform === 'android' ? '🤖 Android' : '💻 PC';
    
    // Badge
    let badgeHtml = '';
    if (p.badge) {
      const bColor = p.badgeColor || '#a855f7';
      badgeHtml = `<span class="badge" style="background: ${bColor}20; color: ${bColor}; border: 1px solid ${bColor}40;">${p.badge}</span>`;
    }

    html += `
      <div class="product-card animate-on-scroll animated" data-category="${p.platform}" style="animation: fadeInUp 0.4s ease-out both;">
        <div class="card-image">
          <div class="card-image-placeholder" style="background: var(--bg-card); display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px;">
            ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div class="logo-icon" style="width: 80px; height: 80px; font-size: 3rem; border-radius: 20px; box-shadow: 0 4px 30px rgba(168, 85, 247, 0.4); display: flex; align-items: center; justify-content: center;">${p.icon || '📦'}</div>`}
          </div>
          ${badgeHtml}
        </div>
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="card-platform ${p.platform}">${platName}</span>
            <div style="font-size: 0.75rem; font-weight: 500; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); color: #f97316;">
                <i style="font-style: normal;">🔥</i> Đã bán ${p.sold || 0}
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981;">
                <i style="font-style: normal;">📦</i> Còn ${p.stock || 0} sản phẩm
              </span>
            </div>
          </div>
          <h3>${p.name}</h3>
          <div class="features-list" style="margin-bottom: 16px;">
            ${featuresHtml}
          </div>
          ${packagesHtml}
          <div class="card-footer">
            <span class="price"><span class="price-val">${(p.price || 0).toLocaleString('vi-VN')}</span> <span class="currency">VNĐ</span></span>
            <button class="btn btn-primary btn-sm btn-buy" data-product-id="${p.id}" data-product-name="${p.name.replace(/"/g, '&quot;')}">Mua Ngay</button>
          </div>
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = html;
  
  grid.querySelectorAll('.product-card').forEach(card => {
    const select = card.querySelector('.pkg-select');
    const priceSpan = card.querySelector('.price-val');
    
    // Update price span when select changes
    if (select && select.tagName === 'SELECT') {
      select.addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        const p = parseInt(opt.getAttribute('data-price')) || 0;
        if (priceSpan) priceSpan.innerText = p.toLocaleString('vi-VN');
      });
      // trigger once
      select.dispatchEvent(new Event('change'));
    } else if (select && select.tagName === 'INPUT' && priceSpan) {
      const p = parseInt(select.getAttribute('data-price')) || 0;
      priceSpan.innerText = p.toLocaleString('vi-VN');
    }

    const btn = card.querySelector('.btn-buy');
    if (btn) {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-product-id');
        const name = this.getAttribute('data-product-name');
        
        let pkgId, pkgName, pkgPrice;
        if (select && select.tagName === 'SELECT') {
          const opt = select.options[select.selectedIndex];
          pkgId = opt.value;
          pkgName = opt.getAttribute('data-name');
          pkgPrice = parseInt(opt.getAttribute('data-price'));
        } else if (select) {
          pkgId = select.value;
          pkgName = select.getAttribute('data-name');
          pkgPrice = parseInt(select.getAttribute('data-price'));
        }
        
        openContact(id, name, pkgId, pkgName, pkgPrice);
      });
    }
  });
  
  // Re-init filters if on homepage
  initProductFiltering();
}
