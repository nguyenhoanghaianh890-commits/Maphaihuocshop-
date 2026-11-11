(function() {
      // Open modal
      window.openNaptienModal = async function() {
        if (typeof AUTH === 'undefined' || !AUTH.isLoggedIn()) {
          alert('Bạn cần đăng nhập để nạp tiền!');
          window.location.href = 'login.html';
          return;
        }
        
        let bankInfo = { bankName: 'MB Bank', bankNumber: '0123456789', bankOwner: 'NGUYEN VAN A' };
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            bankInfo = await res.json();
          }
        } catch(e) {}

        // Remove any existing modal
        const old = document.querySelector('.naptien-modal');
        if (old) old.remove();

        const user = AUTH.getCurrentUser();
        const username = user.email || user.paymentCode || user.fullName || user.id;
        const modal = document.createElement('div');
        modal.className = 'naptien-modal';
        
        // Use VietQR API with dynamic bank info
        // Example: https://img.vietqr.io/image/mbbank-0123456789-compact2.png?amount=0&addInfo=NAP%20USERNAME&accountName=NGUYEN%20VAN%20A
        // Safe URL encoding
        const bankId = encodeURIComponent(bankInfo.bankName.replace(/ /g, '').toLowerCase());
        const bankNum = encodeURIComponent(bankInfo.bankNumber.replace(/ /g, ''));
        const bankOwner = encodeURIComponent(bankInfo.bankOwner);
        const transferContent = encodeURIComponent('NAP ' + username);
        const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankNum}-compact2.png?amount=0&addInfo=${transferContent}&accountName=${bankOwner}`;

        // Build HTML with real bank info
        modal.innerHTML = `
          <div class="naptien-overlay"></div>
          <div class="naptien-box">
            <div id="ntSuccessOverlay" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(30,30,46,0.95); z-index:10; border-radius:16px; flex-direction:column; align-items:center; justify-content:center;">
              <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
              <div style="color: #34d399; font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">Thanh Toán Thành Công!</div>
              <div style="color: #e8e8f0; font-size: 0.9rem; margin-bottom: 20px;">Tiền đã được cộng vào tài khoản của bạn.</div>
              <button class="btn btn-primary" onclick="window.location.reload()">Đóng & Tải Lại Trang</button>
            </div>
            <button class="naptien-close">&times;</button>
            <div class="naptien-title">💰 Nạp Tiền Vào Tài Khoản</div>

            <div class="naptien-tabs">
              <button class="naptien-tab active" data-tab="qr">📱 QR / Chuyển khoản</button>
              <button class="naptien-tab" data-tab="card">💳 Thẻ Cào</button>
            </div>
            
            <div id="ntSuccessOverlay" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(30,30,46,0.95); z-index:10; border-radius:16px; flex-direction:column; align-items:center; justify-content:center;">
              <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
              <div style="color: #34d399; font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">Thanh Toán Thành Công!</div>
              <div style="color: #e8e8f0; font-size: 0.9rem; margin-bottom: 20px;">Tiền đã được cộng vào tài khoản của bạn.</div>
              <button class="btn btn-primary" onclick="window.location.reload()">Đóng & Tải Lại Trang</button>
            </div>

            <!-- QR Tab -->
            <div class="naptien-panel" data-panel="qr">
              <div class="naptien-qr-wrap" id="ntQrSetup">
                <div style="text-align:left; margin-bottom: 12px; font-weight: 600; color: #8b8ba7; font-size: 0.85rem;">CHỌN MỆNH GIÁ NẠP</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                  <button class="nt-amount-btn" onclick="selectAmount(50000, this)">50.000 đ</button>
                  <button class="nt-amount-btn" onclick="selectAmount(100000, this)">100.000 đ</button>
                  <button class="nt-amount-btn" onclick="selectAmount(200000, this)">200.000 đ</button>
                  <button class="nt-amount-btn" onclick="selectAmount(500000, this)">500.000 đ</button>
                </div>
                
                <div style="text-align:left; margin-bottom: 6px; font-weight: 600; color: #8b8ba7; font-size: 0.85rem;">HOẶC NHẬP SỐ KHÁC</div>
                <div class="naptien-field" style="margin-bottom: 20px; position: relative;">
                  <input type="number" id="ntCustomAmount" placeholder="VD: 150000" oninput="clearAmountSelection()">
                  <span style="position: absolute; right: 14px; top: 12px; color: #8b8ba7; font-weight: 600;">VNĐ</span>
                </div>
                
                <button class="naptien-submit" style="background: linear-gradient(135deg, #f59e0b, #ea580c); box-shadow: 0 4px 20px rgba(245,158,11,.3); font-size: 1.05rem;" onclick="generateQR()">
                  <span style="margin-right: 8px;">🔄</span> Tạo mã QR thanh toán
                </button>
              </div>

              <div class="naptien-qr-wrap" id="ntQrDisplay" style="display: none; position: relative;">

                <p class="naptien-qr-note">
                  NỘI DUNG CHUYỂN:<br>
                  <span class="naptien-highlight" style="font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="copyTransferContent('NAP ${username}')">
                    NAP ${username} <span style="font-size: 0.9rem;">📋</span>
                  </span>
                </p>
                <div class="naptien-qr-code">
                  <img id="ntQrImg" src="" alt="QR Code">
                </div>
                <div class="naptien-bank-info">
                  <p><strong>🏦 Ngân hàng:</strong> ${bankInfo.bankName}</p>
                  <p><strong>💳 Số TK:</strong> ${bankInfo.bankNumber}</p>
                  <p><strong>👤 Tên:</strong> ${bankInfo.bankOwner}</p>
                  <p style="margin-top:10px;color:#a78bfa;font-size:.82rem;">⚡ Hệ thống đang chờ thanh toán...</p>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                  <button class="btn btn-sm" style="flex: 1; background: rgba(255,255,255,0.1);" onclick="resetQrSetup()">Quay lại</button>
                  <button class="btn btn-sm" style="flex: 1; background: rgba(59,130,246,0.2); color: #60a5fa;" onclick="checkPaymentManual(this)">🔄 Kiểm tra GD</button>
                </div>
              </div>
            </div>

            <!-- Card Tab -->
            <div class="naptien-panel" data-panel="card" style="display:none;">
              <form class="naptien-card-form" id="ntCardForm">
                <div class="naptien-field">
                  <label>Nhà mạng</label>
                  <select required>
                    <option value="">— Chọn nhà mạng —</option>
                    <option value="VIETTEL">Viettel</option>
                    <option value="VINAPHONE">Vinaphone</option>
                    <option value="MOBIFONE">Mobifone</option>
                    <option value="VIETNAMOBILE">Vietnamobile</option>
                    <option value="GARENA">Garena</option>
                    <option value="ZING">Zing</option>
                    <option value="VCOIN">Vcoin</option>
                    <option value="FUNCARD">Funcard</option>
                    <option value="SCOIN">Scoin</option>
                    <option value="GOSU">Gosu</option>
                    <option value="SOHA">Sohacoin</option>
                    <option value="KUL">KUL</option>
                  </select>
                </div>
                <div class="naptien-field">
                  <label>Mệnh giá</label>
                  <select required>
                    <option value="">— Chọn mệnh giá —</option>
                    <option value="10000">10.000đ</option>
                    <option value="20000">20.000đ</option>
                    <option value="50000">50.000đ</option>
                    <option value="100000">100.000đ</option>
                    <option value="200000">200.000đ</option>
                    <option value="500000">500.000đ</option>
                  </select>
                </div>
                <div class="naptien-field">
                  <label>Mã thẻ (PIN)</label>
                  <input type="text" placeholder="Nhập mã PIN trên thẻ" required>
                </div>
                <div class="naptien-field">
                  <label>Số Serial</label>
                  <input type="text" placeholder="Nhập số Serial" required>
                </div>
                <button type="submit" class="naptien-submit">⚡ Nạp Thẻ Ngay</button>
                <div class="naptien-msg" id="ntCardMsg"></div>
              </form>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Close handlers
        const closeModal = () => {
          if (typeof pollInterval !== 'undefined') clearInterval(pollInterval);
          modal.remove();
        };
        modal.querySelector('.naptien-overlay').onclick = closeModal;
        modal.querySelector('.naptien-close').onclick = closeModal;

        // Tab switching
        modal.querySelectorAll('.naptien-tab').forEach(tab => {
          tab.onclick = () => {
            modal.querySelectorAll('.naptien-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            modal.querySelectorAll('.naptien-panel').forEach(p => {
              p.style.display = p.dataset.panel === target ? 'block' : 'none';
            });
          };
        });

        // --- QR Logic ---
        let selectedAmount = 0;
        
        window.selectAmount = function(amount, btnElement) {
          selectedAmount = amount;
          document.getElementById('ntCustomAmount').value = '';
          modal.querySelectorAll('.nt-amount-btn').forEach(b => b.classList.remove('selected'));
          btnElement.classList.add('selected');
        };
        
        window.clearAmountSelection = function() {
          modal.querySelectorAll('.nt-amount-btn').forEach(b => b.classList.remove('selected'));
          selectedAmount = 0;
        };
        
        window.generateQR = function() {
          let amount = selectedAmount;
          const customInput = document.getElementById('ntCustomAmount').value;
          if (customInput) {
            amount = parseInt(customInput);
          }
          
          if (!amount || amount < 2000) {
            alert('Vui lòng nhập số tiền hợp lệ (Tối thiểu 2.000đ)');
            return;
          }
          
          // Generate QR with amount
          const bankId = encodeURIComponent(bankInfo.bankName.replace(/ /g, '').toLowerCase());
          const bankNum = encodeURIComponent(bankInfo.bankNumber.replace(/ /g, ''));
          const bankOwner = encodeURIComponent(bankInfo.bankOwner);
          const transferContent = encodeURIComponent('NAP ' + username);
          const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankNum}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${bankOwner}`;
          
          document.getElementById('ntQrImg').src = qrUrl;
          document.getElementById('ntQrSetup').style.display = 'none';
          document.getElementById('ntQrDisplay').style.display = 'block';
        };
        
        window.resetQrSetup = function() {
          document.getElementById('ntQrDisplay').style.display = 'none';
          document.getElementById('ntQrSetup').style.display = 'block';
        };
        
        window.copyTransferContent = function(text) {
          navigator.clipboard.writeText(text).then(() => {
            alert('Đã copy nội dung chuyển khoản: ' + text);
          });
        };
        
        // Auto Polling Logic
        let pollInterval;
        const initialBalance = user.balance || 0;
        
        async function checkBalanceStatus(btn = null) {
          try {
            // Tự động gọi API check bank (Thueapibank) để check và cộng tiền siêu tốc
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
            await fetch('/api/cron/thueapibank?key=cron123', { signal: controller.signal }).catch(e => {});
            clearTimeout(timeoutId);

            const u = await AUTH.syncUser();
            if (u && u.balance > initialBalance) {
              // Success!
              clearInterval(pollInterval);
              document.getElementById('ntSuccessOverlay').style.display = 'flex';
              AUTH.updateBalanceFromServer(); // update navbar
              if (btn) { btn.textContent = 'Thành công!'; btn.disabled = false; }
              return true;
            }
          } catch(e) {}
          
          if (btn) {
            btn.textContent = 'Chưa nhận được...';
            setTimeout(() => { btn.textContent = '🔄 Kiểm tra GD'; btn.disabled = false; }, 2000);
          }
          return false;
        }

        window.checkPaymentManual = function(btn) {
          btn.disabled = true;
          btn.textContent = 'Đang tải...';
          checkBalanceStatus(btn);
        };
        
        pollInterval = setInterval(checkBalanceStatus, 5000); // Check every 5s

        // Handle Card Form Submit
        const ntForm = document.getElementById('ntCardForm');
        if (ntForm) {
          ntForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = ntForm.querySelector('button[type="submit"]');
            const msg = document.getElementById('ntCardMsg');
            
            btn.disabled = true;
            btn.textContent = 'Đang xử lý...';
            msg.textContent = '';
            
            const selects = ntForm.querySelectorAll('select');
            const inputs = ntForm.querySelectorAll('input');
            const network = selects[0].value;
            const amount = parseInt(selects[1].value);
            const pin = inputs[0].value;
            const serial = inputs[1].value;
            const user = AUTH.getCurrentUser();

            // Submit to Charging API
            try {
              const res = await AUTH.authFetch('/api/user/charging', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  telco: network,
                  amount: amount,
                  serial: serial,
                  code: pin
                })
              });
              
              const data = await res.json();
              if (res.ok) {
                msg.textContent = '✅ ' + data.message + '. Hệ thống đang tự động kiểm tra...';
                msg.className = 'naptien-msg success';
                ntForm.reset();
                // Ensure polling continues
                if (typeof pollInterval === 'undefined') {
                  pollInterval = setInterval(checkBalanceStatus, 5000);
                }
              } else {
                msg.textContent = '❌ Lỗi: ' + data.error;
                msg.className = 'naptien-msg error';
                msg.style.color = '#ef4444';
                msg.style.background = 'rgba(239,68,68,0.1)';
                msg.style.borderColor = 'rgba(239,68,68,0.2)';
              }
            } catch (err) {
              msg.textContent = '❌ Lỗi kết nối máy chủ.';
              msg.className = 'naptien-msg error';
              msg.style.color = '#ef4444';
            }

            btn.disabled = false;
            btn.textContent = '⚡ Nạp Thẻ Ngay';
          });
        }

        // Close on Escape
        const escHandler = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
      };
    })();