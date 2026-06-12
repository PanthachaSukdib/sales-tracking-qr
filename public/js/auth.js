// public/js/auth.js
// ระบบยืนยันตัวตนพนักงาน (Supabase Authentication & Session Management)

let supabaseClient = null;

// ดึงการตั้งค่า Supabase Anon Credentials จากเซิร์ฟเวอร์หลังบ้าน
async function initSupabase() {
    try {
        const res = await fetch('/api/config/supabase-anon');
        if (!res.ok) throw new Error('Failed to fetch Supabase config');
        const cfg = await res.json();
        
        // เริ่มต้น Supabase Client
        supabaseClient = supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
        console.log('Supabase Auth Client initialized successfully.');
        
        // ติดตั้งตัวรับฟังสถานะล็อกอิน (Auth State Listener)
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log(`Auth state event: ${event}`);
            handleAuthState(session);
        });

        // เช็ค Session ปัจจุบันทันทีที่เปิดเว็บ
        const { data: { session } } = await supabaseClient.auth.getSession();
        handleAuthState(session);

    } catch (err) {
        console.error('Supabase initialization error:', err);
        showAuthToast('ไม่สามารถเปิดใช้งานระบบความปลอดภัยได้ กรุณารีเฟรชหน้าเว็บ', 'error');
    }
}

// จัดการการแสดงผลหน้าจอตามสถานะล็อกอิน
function handleAuthState(session) {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');

    if (session) {
        // ล็อกอินแล้ว -> ซ่อนฟอร์มล็อกอิน, แสดงแผงควบคุม QR
        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';

        // โหลดข้อมูลรายชื่อพนักงานทันทีหลังจากล็อกอินสำเร็จ
        if (window.loadEmployeeData) {
            window.loadEmployeeData();
        }
    } else {
        // ยังไม่ได้ล็อกอิน -> แสดงฟอร์มล็อกอิน, ซ่อนหน้า QR
        if (loginContainer) loginContainer.style.display = 'block';
        if (appContainer) appContainer.style.display = 'none';
        
        // เคลียร์ค่าฟอร์มสร้าง QR เดิม
        if (window.cleanupQrSection) {
            window.cleanupQrSection();
        }
    }
}

// ฟังก์ชันดึง Access Token ปัจจุบันสำหรับแนบกับ Header ไปหลังบ้าน
async function getAuthToken() {
    if (!supabaseClient) return null;
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session ? session.access_token : null;
}

// ฟังก์ชันแสดง Toast แจ้งเตือนเฉพาะเรื่อง Auth
function showAuthToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-container';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `toast-container show ${type}`;
    setTimeout(() => {
        toast.className = 'toast-container';
    }, 3000);
}

// ==========================================
// 🔐 ระบบเข้าสู่ระบบ (SIGN IN METHODS)
// ==========================================

// 1. ล็อกอินด้วย Password (เมลกลาง: nui.panthcha@gmail.com)
async function loginWithPassword(email, password) {
    if (!supabaseClient) return;
    
    const btn = document.getElementById('btn-login-pass');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังตรวจสอบ...';

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        showAuthToast('เข้าสู่ระบบเมลกลางสำเร็จ!');
    } catch (err) {
        console.error('Password login failed:', err);
        showAuthToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 2. ขอรหัส OTP ไปยังอีเมล (Request Email OTP)
async function requestEmailOtp(email) {
    if (!supabaseClient) return;

    // ตรวจสอบความปลอดภัย: อนุญาตเฉพาะเมลกลาง หรืออีเมลที่ลงท้ายด้วยโดเมนบริษัท @sst.co.th เท่านั้น
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'nui.panthcha@gmail.com' && !cleanEmail.endsWith('@sst.co.th')) {
        showAuthToast('อีเมลนี้ไม่ได้รับสิทธิ์ (ต้องลงท้ายด้วย @sst.co.th หรือเมลกลาง)', 'error');
        return;
    }

    const btn = document.getElementById('btn-send-otp');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังส่ง OTP...';

    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email: cleanEmail,
            options: {
                shouldCreateUser: false // จำกัดเฉพาะพนักงานที่แอดมินแอดชื่อไว้แล้วเท่านั้น
            }
        });

        if (error) throw error;

        // สลับแสดงช่องกรอกรหัส OTP
        document.getElementById('otp-request-section').style.display = 'none';
        document.getElementById('otp-verify-section').style.display = 'block';
        document.getElementById('otp-verify-email').textContent = cleanEmail;
        
        showAuthToast('ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว กรุณาตรวจสอบกล่องจดหมาย');
    } catch (err) {
        console.error('OTP request failed:', err);
        showAuthToast('ส่งรหัส OTP ล้มเหลว (ตรวจสอบอีเมลว่ามีในระบบแล้วหรือไม่)', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 3. ยืนยันรหัส OTP (Verify Email OTP)
async function verifyEmailOtp(email, otpCode) {
    if (!supabaseClient) return;

    const btn = document.getElementById('btn-verify-otp');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังยืนยัน...';

    try {
        const { error } = await supabaseClient.auth.verifyOtp({
            email: email,
            token: otpCode,
            type: 'email'
        });

        if (error) throw error;
        showAuthToast('ยืนยันรหัส OTP สำเร็จ ยินดีต้อนรับ!');
    } catch (err) {
        console.error('OTP verification failed:', err);
        showAuthToast('รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งาน', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 4. ออกจากระบบ (Log Out)
async function handleLogout() {
    if (!supabaseClient) return;
    try {
        await supabaseClient.auth.signOut();
        showAuthToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
        console.error('Logout failed:', err);
        showAuthToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    }
}

// ==========================================
// 🖥️ UI EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // โหลดฐานข้อมูล Supabase
    initSupabase();

    // 1. สลับแท็บวิธีการล็อกอิน (Password vs OTP)
    const tabPass = document.getElementById('tab-pass');
    const tabOtp = document.getElementById('tab-otp');
    const formPass = document.getElementById('form-pass');
    const formOtp = document.getElementById('form-otp');

    if (tabPass && tabOtp) {
        tabPass.addEventListener('click', () => {
            tabPass.classList.add('active');
            tabOtp.classList.remove('active');
            formPass.style.display = 'block';
            formOtp.style.display = 'none';
        });

        tabOtp.addEventListener('click', () => {
            tabOtp.classList.add('active');
            tabPass.classList.remove('active');
            formOtp.style.display = 'block';
            formPass.style.display = 'none';
        });
    }

    // 2. ล็อกอินด้วย Password Submit
    const loginPassForm = document.getElementById('login-pass-form');
    if (loginPassForm) {
        loginPassForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            loginWithPassword(email, pass);
        });
    }

    // 3. ขอรหัส OTP Submit
    const btnSendOtp = document.getElementById('btn-send-otp');
    if (btnSendOtp) {
        btnSendOtp.addEventListener('click', () => {
            const email = document.getElementById('otp-email').value;
            if (!email) {
                showAuthToast('กรุณากรอกอีเมลของท่าน', 'error');
                return;
            }
            requestEmailOtp(email);
        });
    }

    // 4. ยืนยันรหัส OTP Submit
    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', () => {
            const email = document.getElementById('otp-verify-email').textContent;
            const code = document.getElementById('otp-code').value.trim();
            if (!code || code.length !== 6) {
                showAuthToast('กรุณากรอกรหัส OTP จำนวน 6 หลักให้ครบถ้วน', 'error');
                return;
            }
            verifyEmailOtp(email, code);
        });
    }

    // 5. ปุ่มกลับหน้ากรอกอีเมล (ย้อนกลับจากรหัส OTP)
    const btnBackOtp = document.getElementById('btn-back-otp');
    if (btnBackOtp) {
        btnBackOtp.addEventListener('click', () => {
            document.getElementById('otp-verify-section').style.display = 'none';
            document.getElementById('otp-request-section').style.display = 'block';
            document.getElementById('otp-code').value = '';
        });
    }

    // 6. ปุ่มออกจากระบบ (Log Out)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

// ส่งออกฟังก์ชันเพื่อให้ script อื่นสามารถเรียกใช้งานได้
window.getAuthToken = getAuthToken;
window.handleLogout = handleLogout;
