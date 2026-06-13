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
        if (loginContainer) loginContainer.style.display = 'flex';
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

// Helper: แปลงเบอร์โทรศัพท์มือถือไทยปกติ เป็นรูปแบบสากล E.164 (+66)
function formatThaiPhoneNumber(phone) {
    let cleaned = phone.trim().replace(/[-\s]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '+66' + cleaned.substring(1);
    }
    return cleaned;
}

// 1. ขอรหัส OTP ไปยังอีเมล (Request Email OTP)
async function requestEmailOtp(email) {
    if (!supabaseClient) return;

    const btn = document.getElementById('btn-send-email-otp');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังส่ง OTP...';

    const cleanEmail = email.trim();

    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email: cleanEmail,
            options: {
                shouldCreateUser: true // อนุญาตให้สมัครใช้งานด้วยเมลทั่วไปได้ทันที
            }
        });

        if (error) throw error;

        // สลับแสดงช่องกรอกรหัส OTP
        document.getElementById('email-request-section').style.display = 'none';
        document.getElementById('email-verify-section').style.display = 'block';
        document.getElementById('email-verify-target').textContent = cleanEmail;
        
        showAuthToast('ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว! กรุณาตรวจสอบกล่องจดหมาย');
    } catch (err) {
        console.error('Email OTP request failed:', err);
        showAuthToast('ขอรหัส OTP ล้มเหลว กรุณาตรวจสอบความถูกต้องของอีเมล', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 2. ยืนยันรหัส OTP อีเมล (Verify Email OTP)
async function verifyEmailOtp(email, otpCode) {
    if (!supabaseClient) return;

    const btn = document.getElementById('btn-verify-email-otp');
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
        showAuthToast('ยืนยันรหัส OTP อีเมลสำเร็จ ยินดีต้อนรับ!');
    } catch (err) {
        console.error('Email OTP verification failed:', err);
        showAuthToast('รหัส OTP ไม่ถูกต้องหรือหมดอายุ', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 3. ขอรหัส OTP ไปยังเบอร์โทรศัพท์ (Request SMS OTP)
async function requestPhoneOtp(phone) {
    if (!supabaseClient) return;

    const btn = document.getElementById('btn-send-phone-otp');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังส่ง OTP...';

    const formattedPhone = formatThaiPhoneNumber(phone);

    if (!formattedPhone.startsWith('+') || formattedPhone.length < 10) {
        showAuthToast('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 'error');
        btn.disabled = false;
        btn.textContent = origText;
        return;
    }

    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            phone: formattedPhone
        });

        if (error) throw error;

        // สลับแสดงช่องกรอกรหัส OTP
        document.getElementById('phone-request-section').style.display = 'none';
        document.getElementById('phone-verify-section').style.display = 'block';
        document.getElementById('phone-verify-target').textContent = formattedPhone;
        
        showAuthToast('ส่งรหัส OTP ทาง SMS สำเร็จ! กรุณาตรวจสอบข้อความมือถือ');
    } catch (err) {
        console.error('Phone OTP request failed:', err);
        showAuthToast('ส่ง SMS OTP ล้มเหลว (กรุณาเช็คว่าเปิดใช้งาน Phone provider ใน Supabase แล้วหรือไม่)', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 4. ยืนยันรหัส OTP เบอร์โทรศัพท์ (Verify SMS OTP)
async function verifyPhoneOtp(phone, otpCode) {
    if (!supabaseClient) return;

    const btn = document.getElementById('btn-verify-phone-otp');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังยืนยัน...';

    const formattedPhone = formatThaiPhoneNumber(phone);

    try {
        const { error } = await supabaseClient.auth.verifyOtp({
            phone: formattedPhone,
            token: otpCode,
            type: 'sms'
        });

        if (error) throw error;
        showAuthToast('ยืนยันรหัส OTP มือถือสำเร็จ ยินดีต้อนรับ!');
    } catch (err) {
        console.error('Phone OTP verification failed:', err);
        showAuthToast('รหัส OTP ไม่ถูกต้องหรือหมดอายุ', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
}

// 5. ออกจากระบบ (Log Out)
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

// Helper: ตั้งค่ากล่องกรอก OTP แบบ 6 ช่องแยกกัน
function setupOtpInputs(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const inputs = wrapper.querySelectorAll('.otp-box');

    inputs.forEach((input, index) => {
        // จำกัดให้กรอกเฉพาะตัวเลข
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก
            e.target.value = val.replace(/[^0-9]/g, '');
            
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // จัดการปุ่ม Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
                // เคลียร์ค่าตัวกล่องก่อนหน้าด้วย
                inputs[index - 1].value = '';
            }
        });

        // จัดการการวางข้อมูล (Paste)
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
            if (/^\d{6}$/.test(pastedData)) {
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].value = pastedData[i] || '';
                }
                inputs[inputs.length - 1].focus();
            }
        });
    });
}

// ==========================================
// 🖥️ UI EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // โหลดฐานข้อมูล Supabase
    initSupabase();

    // เริ่มต้นตัวช่วยจัดการกล่องกรอก OTP แยกช่อง
    setupOtpInputs('email-otp-wrapper');
    setupOtpInputs('phone-otp-wrapper');

    // 1. สลับแท็บวิธีการล็อกอิน (Email OTP vs Phone OTP)
    const tabEmail = document.getElementById('tab-email');
    const tabPhone = document.getElementById('tab-phone');
    const formEmail = document.getElementById('form-email-otp');
    const formPhone = document.getElementById('form-phone-otp');

    if (tabEmail && tabPhone) {
        tabEmail.addEventListener('click', () => {
            tabEmail.classList.add('active');
            tabPhone.classList.remove('active');
            formEmail.style.display = 'block';
            formPhone.style.display = 'none';
        });

        tabPhone.addEventListener('click', () => {
            tabPhone.classList.add('active');
            tabEmail.classList.remove('active');
            formPhone.style.display = 'block';
            formEmail.style.display = 'none';
        });
    }

    // 2. ขอรหัส OTP อีเมล Submit
    const btnSendEmailOtp = document.getElementById('btn-send-email-otp');
    if (btnSendEmailOtp) {
        btnSendEmailOtp.addEventListener('click', () => {
            const email = document.getElementById('email-otp-input').value;
            if (!email) {
                showAuthToast('กรุณากรอกอีเมลของคุณ', 'error');
                return;
            }
            requestEmailOtp(email);
        });
    }

    // 3. ยืนยันรหัส OTP อีเมล Submit
    const btnVerifyEmailOtp = document.getElementById('btn-verify-email-otp');
    if (btnVerifyEmailOtp) {
        btnVerifyEmailOtp.addEventListener('click', () => {
            const email = document.getElementById('email-verify-target').textContent;
            
            // ดึงรหัสผ่าน 6 ช่องมารวมกัน
            const inputs = document.querySelectorAll('#email-otp-wrapper .otp-box');
            let code = '';
            inputs.forEach(input => code += input.value.trim());

            if (!code || code.length !== 6) {
                showAuthToast('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน', 'error');
                return;
            }
            verifyEmailOtp(email, code);
        });
    }

    // 4. ปุ่มย้อนกลับจากหน้ากรอกรหัส OTP อีเมล
    const btnBackEmailOtp = document.getElementById('btn-back-email-otp');
    if (btnBackEmailOtp) {
        btnBackEmailOtp.addEventListener('click', () => {
            document.getElementById('email-verify-section').style.display = 'none';
            document.getElementById('email-request-section').style.display = 'block';
            // เคลียร์ช่องกรอกทั้ง 6 ช่อง
            document.querySelectorAll('#email-otp-wrapper .otp-box').forEach(input => input.value = '');
        });
    }

    // 5. ขอรหัส OTP เบอร์โทรศัพท์ Submit
    const btnSendPhoneOtp = document.getElementById('btn-send-phone-otp');
    if (btnSendPhoneOtp) {
        btnSendPhoneOtp.addEventListener('click', () => {
            const phone = document.getElementById('phone-otp-input').value;
            if (!phone) {
                showAuthToast('กรุณากรอกเบอร์โทรศัพท์ของคุณ', 'error');
                return;
            }
            requestPhoneOtp(phone);
        });
    }

    // 6. ยืนยันรหัส OTP เบอร์โทรศัพท์ Submit
    const btnVerifyPhoneOtp = document.getElementById('btn-verify-phone-otp');
    if (btnVerifyPhoneOtp) {
        btnVerifyPhoneOtp.addEventListener('click', () => {
            const phone = document.getElementById('phone-verify-target').textContent;
            
            // ดึงรหัสผ่าน 6 ช่องมารวมกัน
            const inputs = document.querySelectorAll('#phone-otp-wrapper .otp-box');
            let code = '';
            inputs.forEach(input => code += input.value.trim());

            if (!code || code.length !== 6) {
                showAuthToast('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน', 'error');
                return;
            }
            verifyPhoneOtp(phone, code);
        });
    }

    // 7. ปุ่มย้อนกลับจากหน้ากรอกรหัส OTP เบอร์โทรศัพท์
    const btnBackPhoneOtp = document.getElementById('btn-back-phone-otp');
    if (btnBackPhoneOtp) {
        btnBackPhoneOtp.addEventListener('click', () => {
            document.getElementById('phone-verify-section').style.display = 'none';
            document.getElementById('phone-request-section').style.display = 'block';
            // เคลียร์ช่องกรอกทั้ง 6 ช่อง
            document.querySelectorAll('#phone-otp-wrapper .otp-box').forEach(input => input.value = '');
        });
    }

    // 8. ปุ่มออกจากระบบ (Log Out)
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
