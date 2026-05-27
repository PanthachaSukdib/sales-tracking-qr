// State management
const surveyState = {
    currentStep: 1,
    session: null,
    pdpa_consent_1: '',
    scores: { q1: 0, q2: 0, q3: 0, q4: 0 },
    improvements: [],
    improvements_other: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    pdpa_consent_2: ''
};

// === Helpers ===
function getSession() {
    try {
        const raw = localStorage.getItem('sst_session');
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (Date.now() > s.expires_at) return null;
        return s;
    } catch { return null; }
}

function showToast(msg, duration = 2500) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.classList.add('show');
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.hidden = true, 300);
    }, duration);
}

function showStep(stepNum) {
    // Hide all steps
    ['step1', 'step2', 'step3', 'step4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
    });

    if (stepNum === 4) {
        // Step 4 has its own full screen, hide main card
        const mainCard = document.getElementById('mainCard');
        if (mainCard) mainCard.hidden = true;
    } else {
        const mainCard = document.getElementById('mainCard');
        if (mainCard) mainCard.hidden = false;
    }

    const stepEl = document.getElementById(`step${stepNum}`);
    if (stepEl) stepEl.hidden = false;
    
    surveyState.currentStep = stepNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDecline() {
    ['step1', 'step2', 'step3', 'step4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
    });
    const mainCard = document.getElementById('mainCard');
    if (mainCard) mainCard.hidden = true;
    
    document.body.innerHTML = `
        <div class="completed-screen">
            <div class="completed-card">
                <div class="tick-circle" style="background: #FEE2E2;">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <path d="M12 12 L28 28 M28 12 L12 28" stroke="#DC2626" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h1 style="color: #DC2626;">ไม่ยินยอมให้ข้อมูล</h1>
                <p class="thank-you">ท่านได้ปฏิเสธการให้ข้อมูลส่วนบุคคล</p>
                <p class="detail">ระบบไม่สามารถดำเนินการต่อได้ ขอบคุณที่ใช้บริการ</p>
            </div>
        </div>
    `;
}

async function logEvent(eventType, metadata = {}) {
    const s = surveyState.session;
    if (!s) return;
    try {
        await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: s.session_id,
                event_type: eventType,
                employee_id: s.emp_id,
                employee_name: s.emp_name,
                customer_name: s.customer,
                project_name: s.project,
                metadata: JSON.stringify(metadata)
            })
        });
    } catch {}
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
    surveyState.session = getSession();
    if (!surveyState.session) {
        document.body.innerHTML = `
            <div class="completed-screen">
                <div class="completed-card">
                    <h2 style="color: #DC2626;">ไม่พบข้อมูลการเข้าใช้</h2>
                    <p style="color: #6B7280; font-size: 14px; margin-top: 12px;">กรุณาสแกน QR Code จากเจ้าหน้าที่อีกครั้ง</p>
                </div>
            </div>
        `;
        return;
    }

    const empNameEl = document.getElementById('empName');
    const projectEl = document.getElementById('projectName');
    const customerEl = document.getElementById('customerName');

    if (empNameEl) empNameEl.textContent = surveyState.session.emp_name || '-';
    if (projectEl) projectEl.textContent = surveyState.session.project || '-';
    if (customerEl) customerEl.textContent = surveyState.session.customer || '-';

    // ถ้าเคยทำแล้ว ให้ข้ามไปหน้า completed ทันที
    if (surveyState.session.already_completed) {
        showStep(4);
        return;
    }

    setupStep1();
    setupStep2();
    setupStep3();
});

// === Step 1 logic ===
function setupStep1() {
    const submitStep1 = async () => {
        const checked = document.querySelector('input[name="pdpa1"]:checked');
        if (!checked) {
            showToast('กรุณาเลือกคำตอบ');
            return;
        }
        surveyState.pdpa_consent_1 = checked.value;

        await logEvent('pdpa_consent_1_answered', { value: checked.value });

        if (checked.value === 'ไม่ยินยอม') {
            await logEvent('declined_at_step_1');
            showDecline();
            return;
        }
        showStep(2);
    };

    const btnInner = document.getElementById('step1BtnInner');
    const btnOuter = document.getElementById('step1BtnOuter');
    
    if (btnInner) btnInner.addEventListener('click', submitStep1);
    if (btnOuter) btnOuter.addEventListener('click', submitStep1);
}

// === Step 2 logic ===
function setupStep2() {
    // Star rating handlers
    document.querySelectorAll('.star-rating').forEach(group => {
        const question = group.dataset.q;
        group.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.val);
                surveyState.scores[question] = value;
                group.querySelectorAll('.star').forEach(s => {
                    // add active class if data-val <= value
                    if (parseInt(s.dataset.val) <= value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    });

    // Checkbox toggles
    const otherCheckbox = document.getElementById('improveOtherCheckbox');
    const otherText = document.getElementById('improveOtherText');
    const noneCheckbox = document.getElementById('improveNone');
    const allCheckboxes = document.querySelectorAll('input[name="improve"]');

    if (otherCheckbox && otherText) {
        otherCheckbox.addEventListener('change', (e) => {
            otherText.hidden = !e.target.checked;
            if (e.target.checked && noneCheckbox) noneCheckbox.checked = false;
        });
    }

    if (noneCheckbox) {
        noneCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // uncheck everything else
                allCheckboxes.forEach(cb => {
                    if (cb !== noneCheckbox) cb.checked = false;
                });
                if (otherText) otherText.hidden = true;
            }
        });
    }

    allCheckboxes.forEach(cb => {
        if (cb !== noneCheckbox) {
            cb.addEventListener('change', (e) => {
                if (e.target.checked && noneCheckbox) {
                    noneCheckbox.checked = false;
                }
            });
        }
    });

    const step2Btn = document.getElementById('step2Btn');
    if (step2Btn) {
        step2Btn.addEventListener('click', async () => {
            const { q1, q2, q3, q4 } = surveyState.scores;
            if (!q1 || !q2 || !q3 || !q4) {
                showToast('กรุณาให้คะแนนดาวครบทั้ง 4 ข้อ');
                return;
            }
            
            const selectedImprovements = Array.from(
                document.querySelectorAll('input[name="improve"]:checked')
            ).map(cb => cb.value);

            if (selectedImprovements.length === 0) {
                showToast('กรุณาเลือกสิ่งที่ควรปรับปรุงอย่างน้อย 1 ข้อ (หรือเลือก ไม่มี)');
                return;
            }

            surveyState.improvements = selectedImprovements;
            
            if (otherCheckbox && otherCheckbox.checked && otherText) {
                surveyState.improvements_other = otherText.value.trim();
                if (!surveyState.improvements_other) {
                    showToast('กรุณาระบุสิ่งที่ควรปรับปรุง');
                    return;
                }
            } else {
                surveyState.improvements_other = '';
            }

            await logEvent('ratings_completed', { scores: surveyState.scores });
            showStep(3);
        });
    }
}

// === Step 3 logic ===
function setupStep3() {
    const pdpaReadMore = document.getElementById('pdpaReadMore2');
    const pdpaText = document.getElementById('pdpaText2');
    
    if (pdpaReadMore && pdpaText) {
        pdpaReadMore.addEventListener('click', (e) => {
            e.preventDefault();
            pdpaText.hidden = !pdpaText.hidden;
            pdpaReadMore.textContent = pdpaText.hidden ? '(อ่านเพิ่มเติม)' : '(ย่อหน้าต่าง)';
        });
    }

    const step3Btn = document.getElementById('step3SubmitBtn');
    if (step3Btn) {
        step3Btn.addEventListener('click', async () => {
            const consentRadio = document.querySelector('input[name="pdpa2"]:checked');
            if (!consentRadio) {
                showToast('กรุณาเลือกการยินยอมข้อมูลส่วนบุคคล');
                return;
            }
            surveyState.pdpa_consent_2 = consentRadio.value;

            surveyState.contact_name = document.getElementById('contactName')?.value.trim() || '';
            surveyState.contact_phone = document.getElementById('contactPhone')?.value.trim() || '';
            surveyState.contact_email = document.getElementById('contactEmail')?.value.trim() || '';

            // ส่งทุกข้อมูลรวมเป็นก้อนเดียวไป backend
            step3Btn.disabled = true;
            step3Btn.textContent = 'กำลังส่ง...';

            try {
                const res = await fetch('/api/survey', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: surveyState.session.session_id,
                        employee_id: surveyState.session.emp_id,
                        employee_name: surveyState.session.emp_name,
                        project_name: surveyState.session.project,
                        customer_name: surveyState.session.customer,
                        pdpa_consent_1: surveyState.pdpa_consent_1,
                        score_q1: surveyState.scores.q1,
                        score_q2: surveyState.scores.q2,
                        score_q3: surveyState.scores.q3,
                        score_q4: surveyState.scores.q4,
                        improvements: surveyState.improvements.join('|'),
                        improvements_other: surveyState.improvements_other,
                        contact_name: surveyState.contact_name,
                        contact_phone: surveyState.contact_phone,
                        contact_email: surveyState.contact_email,
                        pdpa_consent_2: surveyState.pdpa_consent_2
                    })
                });
                
                if (!res.ok) throw new Error('submit failed');
                
                await logEvent('survey_submitted', {
                    avg_score: (surveyState.scores.q1 + surveyState.scores.q2 + surveyState.scores.q3 + surveyState.scores.q4) / 4,
                    gave_contact: consentRadio.value === 'ยินยอม'
                });
                
                // Mark completed so re-scans go straight to completed screen
                const project = surveyState.session.project;
                if (project) {
                    localStorage.setItem('sst_completed_project_' + project, 'true');
                }
                localStorage.removeItem('sst_session');
                
                showStep(4);
            } catch (err) {
                console.error(err);
                showToast('ส่งไม่สำเร็จ กรุณาลองอีกครั้ง');
                step3Btn.disabled = false;
                step3Btn.textContent = 'ส่งข้อมูล';
            }
        });
    }
}
