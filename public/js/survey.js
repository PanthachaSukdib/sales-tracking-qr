// public/js/survey.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Parse URL Parameters ---
    const urlParams = new URLSearchParams(window.location.search);
    const empId = urlParams.get('emp_id');
    const empName = urlParams.get('emp_name');
    const project = urlParams.get('project') || 'โครงการทั่วไป';
    const qrLogId = urlParams.get('qr_log_id');

    // --- DOM Elements ---
    const surveyCard = document.getElementById('survey-card');
    const errorCard = document.getElementById('error-card');
    
    const displayEmpName = document.getElementById('display-emp-name');
    const displayProject = document.getElementById('display-project');
    
    const starsDeck = document.getElementById('stars-deck');
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingFeedback = document.getElementById('rating-text-feedback');
    const suggestionsInput = document.getElementById('suggestions');
    const btnSubmit = document.getElementById('btn-submit');
    const toast = document.getElementById('toast');

    // --- Validate Required URL params ---
    if (!empId || !empName) {
        surveyCard.classList.add('hidden');
        errorCard.classList.remove('hidden');
        return;
    }

    // Populate display labels
    displayEmpName.textContent = empName;
    displayProject.textContent = project;

    let selectedRating = 0;

    // --- Thai Rating Feedback mapping ---
    const feedbackMap = {
        1: 'ควรปรับปรุงอย่างยิ่ง 😞',
        2: 'ควรปรับปรุง 😐',
        3: 'ปานกลาง 🙂',
        4: 'ดีมาก 😊',
        5: 'ยอดเยี่ยมที่สุด 🏆'
    };

    // --- Toast Utility ---
    let toastTimeout = null;
    function showToast(message) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // --- Render Active Stars ---
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

    // --- Star Button Events ---
    starButtons.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-value'), 10);

        // Click handler: Set permanent rating
        btn.addEventListener('click', () => {
            selectedRating = val;
            renderStars(selectedRating);
            ratingFeedback.textContent = feedbackMap[selectedRating];
            btnSubmit.disabled = false; // Enable submit button
        });

        // Mouse Hover entry
        btn.addEventListener('mouseenter', () => {
            renderStars(val);
            ratingFeedback.textContent = feedbackMap[val];
        });
    });

    // Mouse Leave: Restore permanent selected rating or default state
    starsDeck.addEventListener('mouseleave', () => {
        renderStars(selectedRating);
        if (selectedRating > 0) {
            ratingFeedback.textContent = feedbackMap[selectedRating];
        } else {
            ratingFeedback.textContent = 'กรุณาเลือกคะแนนประเมิน';
        }
    });

    // --- Submit Form handler ---
    btnSubmit.addEventListener('click', async () => {
        if (selectedRating < 1 || selectedRating > 5) {
            showToast('กรุณาเลือกคะแนนความพึงพอใจก่อนส่ง');
            return;
        }

        // Lock form submit state to avoid double submit
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'กำลังส่งข้อมูล...';
        suggestionsInput.disabled = true;

        try {
            const response = await fetch('/api/survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emp_id: empId,
                    emp_name: empName,
                    project: project,
                    satisfaction_score: selectedRating,
                    suggestions: suggestionsInput.value.trim(),
                    qr_log_id: qrLogId
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
            }

            const data = await response.json();
            
            // Redirect to Thank-you page with selected score
            window.location.href = `thank-you.html?score=${selectedRating}`;

        } catch (error) {
            console.error('Survey submission error:', error);
            showToast(error.message || 'ไม่สามารถบันทึกคำตอบได้ กรุณาลองใหม่อีกครั้ง');
            
            // Unlock fields on error
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'ส่งแบบสอบถาม';
            suggestionsInput.disabled = false;
        }
    });
});
