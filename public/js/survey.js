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

    // ป้องกันการกดย้อนกลับจากหน้า Bridge เพื่อทำประเมินซ้ำใน Session เดิม
    if (session.survey_score) {
        window.location.href = '/next-step.html';
        return;
    }

    document.getElementById('empName').textContent = session.emp_name;
    document.getElementById('projectName').textContent = session.project || '-';
    document.getElementById('customerName').textContent = session.customer || '-';

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

    let toastTimeout = null;
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    let isSubmitting = false;
    btnSubmit.addEventListener('click', async () => {
        if (isSubmitting) return;

        const score = window.getCurrentRating ? window.getCurrentRating() : 0;
        const suggestions = suggestionsInput.value.trim();
        
        if (!score) {
            showToast('กรุณาเลือกระดับความพึงพอใจ');
            return;
        }

        isSubmitting = true;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'กำลังส่งข้อมูล...';
        suggestionsInput.disabled = true;

        // บันทึกคะแนนใน session ชั่วคราวก่อนยิง API เพื่อป้องกันการกดย้อนกลับ/Refresh มาระหว่างบันทึก
        session.survey_score = score;
        localStorage.setItem('sst_session', JSON.stringify(session));

        try {
            // 1. ส่งข้อมูลคะแนนประเมินและข้อเสนอแนะเข้า Google Sheets (พร้อม session_id เพื่อตรวจจับซ้ำที่ฝั่ง Server)
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: session.session_id,
                    emp_id: session.emp_id,
                    emp_name: session.emp_name,
                    project: session.project,
                    customer_name: session.customer,
                    satisfaction_score: score,
                    suggestions
                })
            });
            
            if (!res.ok) throw new Error('Submit failed');

            // บันทึกสถานะว่าทำแบบสอบถามการสแกนนี้เรียบร้อยแล้วลงใน localStorage เพื่อใช้ป้องกันการทำซ้ำทันที
            const completedKey = 'sst_completed_' + session.emp_id + '_' + session.customer + '_' + session.project;
            localStorage.setItem(completedKey, 'true');

            // 2. ยิง Event "survey_submitted" → event tracking
            try {
                await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: session.session_id,
                        event_type: 'survey_submitted',
                        employee_id: session.emp_id,
                        employee_name: session.emp_name,
                        customer_name: session.customer,
                        project_name: session.project,
                        metadata: { score, suggestions: suggestions || null }
                    })
                });
            } catch (evtErr) {
                console.warn('Event tracking failed (continuing):', evtErr);
            }

            // 4. แสดง Toast แจ้งสำเร็จ
            showToast('บันทึกดาวสำเร็จ! กำลังนำคุณไปยังขั้นตอนถัดไป...');

            // 5. Redirect ไปหน้า Bridge (next-step.html) แทน MS Forms โดยตรง
            setTimeout(() => {
                window.location.href = '/next-step.html';
            }, 1200);

        } catch (err) {
            console.error(err);
            // คืนค่าระดับคะแนนใน local storage หากเกิดข้อผิดพลาดในการส่งข้อมูล
            delete session.survey_score;
            localStorage.setItem('sst_session', JSON.stringify(session));

            showToast('ส่งไม่สำเร็จ กรุณาลองอีกครั้ง');
            isSubmitting = false;
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'ส่งคะแนน';
            suggestionsInput.disabled = false;
        }
    });
}
