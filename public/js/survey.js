document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('emp_id');
    const empName = params.get('emp_name');
    const project = params.get('project');
    const customer = params.get('customer');

    const errorCard = document.getElementById('error-card');
    const surveyCard = document.getElementById('survey-card');
    const successCard = document.getElementById('success-card');

    if (!empId || !empName) {
        // Show error if essential params are missing
        if (errorCard) errorCard.classList.remove('hidden');
        if (surveyCard) surveyCard.classList.add('hidden');
    } else {
        // Populate info badge
        document.getElementById('empName').textContent = empName;
        document.getElementById('projectName').textContent = project || '-';
        document.getElementById('customerName').textContent = customer || '-';
        
        if (errorCard) errorCard.classList.add('hidden');
        if (surveyCard) surveyCard.classList.remove('hidden');
    }

    // 2. Star Ratings Logic
    const ratings = { q1: 0, q2: 0, q3: 0, q4: 0 };
    const starContainers = document.querySelectorAll('.stars-container');

    starContainers.forEach(container => {
        const qId = container.getAttribute('data-q');
        const stars = container.querySelectorAll('.star-btn');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-val'), 10);
                ratings[qId] = val;
                
                // Update visual state
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-val'), 10) <= val) {
                        s.classList.add('active');
                        s.textContent = '★'; // Solid star (could use filled icon)
                    } else {
                        s.classList.remove('active');
                        s.textContent = '★';
                    }
                });
            });

            // Optional: Hover effect
            star.addEventListener('mouseenter', () => {
                const hoverVal = parseInt(star.getAttribute('data-val'), 10);
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-val'), 10) <= hoverVal) {
                        s.classList.add('hover-active');
                    }
                });
            });

            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('hover-active'));
            });
        });
    });

    // 3. Improvements Checkboxes
    const improveNone = document.getElementById('improveNone');
    const improveOtherCheckbox = document.getElementById('improveOtherCheckbox');
    const improveOtherText = document.getElementById('improveOtherText');
    const allImproveCheckboxes = document.querySelectorAll('input[name="improve"]');

    improveNone.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Uncheck and disable others
            allImproveCheckboxes.forEach(cb => {
                if (cb !== improveNone) {
                    cb.checked = false;
                    cb.disabled = true;
                }
            });
            improveOtherText.value = '';
            improveOtherText.disabled = true;
        } else {
            // Enable others
            allImproveCheckboxes.forEach(cb => {
                cb.disabled = false;
            });
        }
    });

    improveOtherCheckbox.addEventListener('change', (e) => {
        improveOtherText.disabled = !e.target.checked;
        if (e.target.checked) {
            improveOtherText.focus();
        } else {
            improveOtherText.value = '';
        }
    });

    // 4. PDPA Toggle
    const pdpaToggleBtn = document.getElementById('pdpaToggleBtn');
    const pdpaToggleLessBtn = document.getElementById('pdpaToggleLessBtn');
    const pdpaFullText = document.getElementById('pdpaFullText');

    pdpaToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pdpaFullText.hidden = false;
        pdpaToggleBtn.style.display = 'none';
    });

    pdpaToggleLessBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pdpaFullText.hidden = true;
        pdpaToggleBtn.style.display = 'inline';
    });

    // 5. Submit Form
    const btnSubmit = document.getElementById('btn-submit');
    
    btnSubmit.addEventListener('click', async () => {
        // Validate ratings
        if (ratings.q1 === 0 || ratings.q2 === 0 || ratings.q3 === 0 || ratings.q4 === 0) {
            showToast('กรุณาให้คะแนนความพึงพอใจให้ครบทุกข้อ', 'error');
            return;
        }

        // Validate PDPA
        const pdpaRadio = document.querySelector('input[name="pdpa"]:checked');
        if (!pdpaRadio) {
            showToast('กรุณาเลือกให้ความยินยอมหรือไม่ยินยอมในข้อมูลส่วนบุคคล', 'error');
            return;
        }

        // Collect Improvement Data
        const improvements = [];
        allImproveCheckboxes.forEach(cb => {
            if (cb.checked) {
                if (cb.value === 'อื่นๆ') {
                    if (improveOtherText.value.trim()) {
                        improvements.push(`อื่นๆ: ${improveOtherText.value.trim()}`);
                    }
                } else {
                    improvements.push(cb.value);
                }
            }
        });

        // Collect Contact Info
        const contactData = {
            name: document.getElementById('contactName').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            email: document.getElementById('contactEmail').value.trim()
        };

        const payload = {
            empId,
            empName,
            project,
            customer,
            ratings,
            improvements,
            contactData,
            pdpaConsent: pdpaRadio.value
        };

        // Submit logic
        const originalText = btnSubmit.textContent;
        btnSubmit.textContent = 'กำลังส่งข้อมูล...';
        btnSubmit.disabled = true;

        try {
            const response = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Show Success Screen
            surveyCard.classList.add('hidden');
            successCard.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error submitting survey:', error);
            showToast('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = false;
        }
    });

    // Toast utility
    const toast = document.getElementById('toast');
    function showToast(message, type = 'error') {
        toast.textContent = message;
        toast.className = `toast-container show ${type}`;
        setTimeout(() => {
            toast.className = 'toast-container';
        }, 3000);
    }
});
