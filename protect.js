/**
 * Hệ thống bảo vệ bản quyền & chống F12, chống trích xuất dữ liệu shop Mập Hài Hước
 */
(function() {
  'use strict';

  // Không áp dụng chặn nếu đang ở trang admin hoặc có quyền admin
  const isAdminPage = window.location.pathname.includes('admin');
  const user = (function() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch(e) { return null; }
  })();

  if (isAdminPage || (user && user.role === 'admin')) {
    return; // Cho phép Admin truy cập DevTools
  }

  // 1. Chặn phím tắt F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
  window.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      showBlockedNotice('F12 (Developer Tools) đã bị vô hiệu hóa.');
      return false;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Ctrl + Shift + I (Inspect)
    // Ctrl + Shift + J (Console)
    // Ctrl + Shift + C (Inspect Element)
    if (isCtrlOrCmd && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67 || e.key === 'I' || e.key === 'J' || e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedNotice('Phím tắt kiểm tra trang đã bị vô hiệu hóa.');
      return false;
    }

    // Ctrl + U (View Source)
    if (isCtrlOrCmd && (e.keyCode === 85 || e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedNotice('Xem mã nguồn trang đã bị vô hiệu hóa.');
      return false;
    }

    // Ctrl + S (Save Page)
    if (isCtrlOrCmd && (e.keyCode === 83 || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedNotice('Lưu trang đã bị vô hiệu hóa.');
      return false;
    }
  }, true);

  // 2. Chặn chuột phải (Context Menu)
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showBlockedNotice('Chuột phải đã bị vô hiệu hóa trên hệ thống.');
    return false;
  }, true);

  // 3. Vô hiệu hóa tính năng kéo thả bôi đen để copy mã nguồn
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // 4. Toast thông báo cảnh báo bảo mật
  let toastTimeout = null;
  function showBlockedNotice(msg) {
    let toast = document.getElementById('security-blocked-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'security-blocked-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(15, 17, 26, 0.95);
        color: #ff5252;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255, 82, 82, 0.3);
        border: 1px solid rgba(255, 82, 82, 0.4);
        z-index: 9999999;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span style="font-size: 1.2rem;">🛡️</span> <span>${msg}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }

  // 5. Làm sạch Console & chặn Console sniffing
  try {
    const noop = function() {};
    setInterval(() => {
      console.clear();
    }, 1500);

    // Ghi đè các hàm console để chống trích xuất dữ liệu qua console log
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.table = noop;
    console.dir = noop;
  } catch(e) {}

  // 6. Debugger trap: Nếu mở DevTools, bẫy debugger sẽ kích hoạt
  setInterval(function() {
    const widthDiff = window.outerWidth - window.innerWidth > 160;
    const heightDiff = window.outerHeight - window.innerHeight > 160;
    if (widthDiff || heightDiff) {
      (function() {
        return false;
      }['constructor']('debugger')['call']());
    }
  }, 1000);

})();
