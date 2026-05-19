// public/js/qr-generator.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const employeeIdInput = document.getElementById('employee-id');
    const employeeNameInput = document.getElementById('employee-name');
    const projectNameInput = document.getElementById('project-name');
    const btnGenerate = document.getElementById('btn-generate');
    
    const formCard = document.getElementById('form-card');
    const qrSection = document.getElementById('qr-section');
    const qrCanvas = document.getElementById('qr-canvas');
    
    const summaryEmpId = document.getElementById('summary-emp-id');
    const summaryEmpName = document.getElementById('summary-emp-name');
    const summaryProject = document.getElementById('summary-project');
    
    const btnSave = document.getElementById('btn-save');
    const btnShare = document.getElementById('btn-share');
    const btnCopy = document.getElementById('btn-copy');
    const btnReset = document.getElementById('btn-reset');
    
    const toast = document.getElementById('toast');

    // Global variable to hold the currently generated survey URL
    let generatedSurveyUrl = '';

    // --- 1. Caching with localStorage ---
    if (localStorage.getItem('employee_id')) {
        employeeIdInput.value = localStorage.getItem('employee_id');
    }
    if (localStorage.getItem('employee_name')) {
        employeeNameInput.value = localStorage.getItem('employee_name');
    }

    // --- 2. Toast Utility ---
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

    // --- 3. QR Generation flow ---
    btnGenerate.addEventListener('click', async () => {
        const empId = employeeIdInput.value.trim();
        const empName = employeeNameInput.value.trim();
        const project = projectNameInput.value.trim();

        // Inputs Validation
        if (!empId) {
            showToast('กรุณาระบุรหัสพนักงาน');
            employeeIdInput.focus();
            return;
        }
        if (!empName) {
            showToast('กรุณาระบุชื่อ-นามสกุลพนักงาน');
            employeeNameInput.focus();
            return;
        }
        if (!project) {
            showToast('กรุณาระบุชื่อโครงการ / ลูกค้า');
            projectNameInput.focus();
            return;
        }

        // Save employee credentials to localStorage
        localStorage.setItem('employee_id', empId);
        localStorage.setItem('employee_name', empName);

        // Show loading state
        btnGenerate.disabled = true;
        btnGenerate.textContent = 'กำลังสร้าง QR Code...';

        try {
            // Determine client base URL dynamically
            const surveyBase = window.location.origin + '/survey.html';
            
            // Build temporary query params (we will append final qr_log_id once saved)
            const tempParams = new URLSearchParams({
                emp_id: empId,
                emp_name: empName,
                project: project,
                ts: Date.now()
            });

            const tempUrl = `${surveyBase}?${tempParams.toString()}`;

            // Save log to the backend
            const response = await fetch('/api/qr-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_id: empId,
                    employee_name: empName,
                    project_name: project,
                    generated_url: tempUrl
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            }

            const data = await response.json();
            const qrLogId = data.id;

            // Build final URL including the exact database log ID
            tempParams.append('qr_log_id', qrLogId);
            generatedSurveyUrl = `${surveyBase}?${tempParams.toString()}`;

            // Render QR Code as canvas client-side using CDN qrcode library
            // Palette matches K-Plus bank green #0F6E56 on white background
            await QRCode.toCanvas(qrCanvas, generatedSurveyUrl, {
                width: 240,
                margin: 2,
                color: {
                    dark: '#0F6E56',
                    light: '#FFFFFF'
                }
            });

            // Update Summary Texts
            summaryEmpId.textContent = empId;
            summaryEmpName.textContent = empName;
            summaryProject.textContent = project;

            // Transition UI Panels
            formCard.classList.add('hidden');
            qrSection.classList.remove('hidden');
            
            // Smooth view transitions
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('สร้าง QR Code สำเร็จ!');

        } catch (error) {
            console.error('QR Generation error:', error);
            showToast(error.message || 'ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            // Restore button state
            btnGenerate.disabled = false;
            btnGenerate.textContent = 'สร้าง QR Code';
        }
    });

    // --- 4. "Save Image" Handler ---
    btnSave.addEventListener('click', () => {
        try {
            const dataUrl = qrCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            const empId = employeeIdInput.value.trim();
            const project = projectNameInput.value.trim().replace(/\s+/g, '_');
            
            link.download = `qr_${empId}_${project}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('บันทึกรูปภาพลงเครื่องสำเร็จ!');
        } catch (err) {
            console.error('Save image error:', err);
            showToast('ไม่สามารถบันทึกรูปภาพได้');
        }
    });

    // --- 5. "Share" Handler (Web Share with Image Support) ---
    btnShare.addEventListener('click', async () => {
        const empId = employeeIdInput.value.trim();
        const project = projectNameInput.value.trim();
        const shareText = `แบบสอบถามความพึงพอใจการให้บริการโดยพนักงานรหัส ${empId} โครงการ ${project}`;

        try {
            // Check if Web Share API Level 2 (with files) is supported
            if (navigator.share) {
                // Try converting the canvas to a PNG file blob
                const blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], `qr_${empId}.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    // Share image + text
                    await navigator.share({
                        title: 'แบบสอบถามความพึงพอใจ',
                        text: shareText,
                        files: [file]
                    });
                    showToast('แชร์ QR Code สำเร็จ!');
                    return;
                } else {
                    // Fallback to text sharing only if files aren't supported
                    await navigator.share({
                        title: 'แบบสอบถามความพึงพอใจ',
                        text: shareText,
                        url: generatedSurveyUrl
                    });
                    showToast('แชร์ลิงก์แบบสอบถามสำเร็จ!');
                    return;
                }
            }
            
            // Fallback for desktop browsers: Copy URL directly
            copyLinkToClipboard();
        } catch (err) {
            // Avoid logging user cancel action as a failure
            if (err.name !== 'AbortError') {
                console.error('Share error:', err);
                copyLinkToClipboard();
            }
        }
    });

    // --- 6. "Copy Link" Helper ---
    function copyLinkToClipboard() {
        if (!generatedSurveyUrl) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(generatedSurveyUrl)
                .then(() => showToast('คัดลอกลิงก์สำเร็จ!'))
                .catch(err => {
                    console.error('Clipboard error:', err);
                    fallbackCopyText(generatedSurveyUrl);
                });
        } else {
            fallbackCopyText(generatedSurveyUrl);
        }
    }

    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('คัดลอกลิงก์สำเร็จ!');
        } catch (err) {
            console.error('Fallback copy error:', err);
            showToast('ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกด้วยตนเอง');
        }
        document.body.removeChild(textArea);
    }

    btnCopy.addEventListener('click', copyLinkToClipboard);

    // --- 7. Reset Form / Create New QR ---
    btnReset.addEventListener('click', () => {
        // Clear Project Field only (keep employee id & name as they are cached)
        projectNameInput.value = '';
        
        // Reset Visual Panels
        qrSection.classList.add('hidden');
        formCard.classList.remove('hidden');
        
        // Scroll back to top
        formCard.scrollIntoView({ behavior: 'smooth' });
    });
});
