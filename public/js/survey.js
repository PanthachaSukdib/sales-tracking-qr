// public/js/survey.js

function loadSession() {
    const raw = localStorage.getItem('sst_session');
    if (!raw) return null;
    try {
        const session = JSON.parse(raw);
        if (Date.now() > session.expires_at) {
            localStorage.removeItem('sst_session');
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const session = loadSession();
    
    if (!session) {
        showNoSessionScreen();
        return;
    }

    document.getElementById('display-emp-name').textContent = session.emp_name;
    document.getElementById('display-project').textContent = session.project || '-';

    setupRating();
    setupSubmit(session);
});

function showNoSessionScreen() {
    const container = document.getElementById('survey-card').parentElement;
    container.innerHTML = `
        <div class="card no-session">
            <div class="warning-icon">⚠️</div>
            <h2>ไม่พบข้อมูลการเข้าใช้</h2>
            <p>กรุณาสแกน QR Code จากเจ้าหน้าที่ใหม่อีกครั้ง<br>
               เพื่อเริ่มต้นกระบวนการประเมิน</p>
        </div>
    `;
}

function setupRating() {
    const starsDeck = document.getElementById('stars-deck');
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingFeedback = document.getElementById('rating-text-feedback');
    const btnSubmit = document.getElementById('btn-submit');

    let selectedRating = 0;
    const feedbackMap = {
        1: 'ควรปรับปรุงอย่างยิ่ง 😞',
        2: 'ควรปรับปรุง 😐',
        3: 'ปานกลาง 🙂',
        4: 'ดีมาก 😊',
        5: 'ยอดเยี่ยมที่สุด 🏆'
    };

    function renderStars(ratingValue) {
        starButtons.forEach(btn => {
            const val = parseInt(btn.getAttribute('data-value'), 10);
            if (val <= ratingValue) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    starButtons.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-value'), 10);
        btn.addEventListener('click', () => {
            selectedRating = val;
            renderStars(selectedRating);
            ratingFeedback.textContent = feedbackMap[selectedRating];
            btnSubmit.disabled = false;
        });
        btn.addEventListener('mouseenter', () => {
            renderStars(val);
            ratingFeedback.textContent = feedbackMap[val];
        });
    });

    starsDeck.addEventListener('mouseleave', () => {
        renderStars(selectedRating);
        if (selectedRating > 0) {
            ratingFeedback.textContent = feedbackMap[selectedRating];
        } else {
            ratingFeedback.textContent = 'กรุณาเลือกคะแนนประเมิน';
        }
    });

    window.getCurrentRating = () => selectedRating;
}

function setupSubmit(session) {
    const btnSubmit = document.getElementById('btn-submit');
    const suggestionsInput = document.getElementById('suggestions');
    const toast = document.getElementById('toast');

    // โหลดลิงก์ Microsoft Forms เตรียมรอไว้ล่วงหน้า
    let msFormsUrl = '';
    fetch('/api/config/ms-forms-url')
        .then(res => res.json())
        .then(cfg => {
            msFormsUrl = cfg.url;
        })
        .catch(err => console.warn('Failed to pre-fetch MS Forms URL:', err));

    let toastTimeout = null;
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    btnSubmit.addEventListener('click', async () => {
        const score = window.getCurrentRating ? window.getCurrentRating() : 0;
        const suggestions = suggestionsInput.value.trim();
        
        if (!score) {
            showToast('กรุณาเลือกระดับความพึงพอใจ');
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'กำลังส่งข้อมูล...';
        suggestionsInput.disabled = true;

        try {
            // 1. ส่งข้อมูลคะแนนประเมินและข้อเสนอแนะเข้า Google Sheets
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emp_id: session.emp_id,
                    emp_name: session.emp_name,
                    project: session.project,
                    customer_name: session.customer || '',
                    satisfaction_score: score,
                    suggestions
                })
            });
            
            if (!res.ok) throw new Error('Submit failed');
            
            // ลบเซสชันของพนักงานออกหลังการประเมินสำเร็จ
            localStorage.removeItem('sst_session');

            // 2. แสดงแจ้งเตือนและเตรียมเปลี่ยนเส้นทางอัตโนมัติ
            showToast('บันทึกดาวสำเร็จ! กำลังนำคุณไปยังหน้าแบบสอบถามเพิ่มเติม...');

            // 3. เปลี่ยนหน้าไปยัง Microsoft Forms อัตโนมัติ (เด้งไปทันที)
            setTimeout(() => {
                if (msFormsUrl) {
                    window.location.href = msFormsUrl;
                } else {
                    // หากดึงลิงก์ไม่สำเร็จ ให้ใช้หน้าขอบคุณปกติเป็นระบบสำรอง (Fallback)
                    window.location.href = `thank-you.html?score=${score}`;
                }
            }, 1200);

        } catch (err) {
            console.error(err);
            showToast('ส่งไม่สำเร็จ กรุณาลองอีกครั้ง');
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'ส่งแบบสอบถาม';
            suggestionsInput.disabled = false;
        }
    });
}
