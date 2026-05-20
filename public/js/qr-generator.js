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

    let generatedSurveyUrl = '';

    if (localStorage.getItem('employee_id')) {
        employeeIdInput.value = localStorage.getItem('employee_id');
    }
    if (localStorage.getItem('employee_name')) {
        employeeNameInput.value = localStorage.getItem('employee_name');
    }

    let toastTimeout = null;
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    btnGenerate.addEventListener('click', async () => {
        const empId = employeeIdInput.value.trim();
        const empName = employeeNameInput.value.trim();
        const project = projectNameInput.value.trim();

        if (!empId) { showToast('กรุณาระบุรหัสพนักงาน'); employeeIdInput.focus(); return; }
        if (!empName) { showToast('กรุณาระบุชื่อ-นามสกุลพนักงาน'); employeeNameInput.focus(); return; }
        if (!project) { showToast('กรุณาระบุชื่อโครงการ / ลูกค้า'); projectNameInput.focus(); return; }

        localStorage.setItem('employee_id', empId);
        localStorage.setItem('employee_name', empName);

        btnGenerate.disabled = true;
        btnGenerate.textContent = 'กำลังสร้าง QR Code...';

        try {
            const QR_REDIRECT_BASE = window.QR_REDIRECT_BASE || '/scan.html';
            const baseUrl = QR_REDIRECT_BASE.startsWith('http')
                ? QR_REDIRECT_BASE
                : window.location.origin + QR_REDIRECT_BASE;
            
            const params = new URLSearchParams({
                emp_id: empId,
                emp_name: empName,
                project: project,
                customer: ''
            });
            generatedSurveyUrl = `${baseUrl}?${params.toString()}`;

            await QRCode.toCanvas(qrCanvas, generatedSurveyUrl, {
                width: 240,
                margin: 2,
                color: { dark: '#0F6E56', light: '#FFFFFF' }
            });

            summaryEmpId.textContent = empId;
            summaryEmpName.textContent = empName;
            summaryProject.textContent = project;

            formCard.classList.add('hidden');
            qrSection.classList.remove('hidden');
            
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('สร้าง QR Code สำเร็จ!');

        } catch (error) {
            console.error('QR Generation error:', error);
            showToast('ไม่สามารถสร้าง QR Code ได้');
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.textContent = 'สร้าง QR Code';
        }
    });

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
            showToast('ไม่สามารถบันทึกรูปภาพได้');
        }
    });

    btnShare.addEventListener('click', async () => {
        const empId = employeeIdInput.value.trim();
        const project = projectNameInput.value.trim();
        const shareText = `แบบสอบถามความพึงพอใจการให้บริการโดยพนักงานรหัส ${empId} โครงการ ${project}`;

        try {
            if (navigator.share) {
                const blob = await new Promise(resolve => qrCanvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], `qr_${empId}.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ title: 'แบบสอบถาม', text: shareText, files: [file] });
                    showToast('แชร์ QR Code สำเร็จ!');
                    return;
                } else {
                    await navigator.share({ title: 'แบบสอบถาม', text: shareText, url: generatedSurveyUrl });
                    showToast('แชร์ลิงก์สำเร็จ!');
                    return;
                }
            }
            copyLinkToClipboard();
        } catch (err) {
            if (err.name !== 'AbortError') { copyLinkToClipboard(); }
        }
    });

    function copyLinkToClipboard() {
        if (!generatedSurveyUrl) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(generatedSurveyUrl)
                .then(() => showToast('คัดลอกลิงก์สำเร็จ!'))
                .catch(() => fallbackCopyText(generatedSurveyUrl));
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
            showToast('ไม่สามารถคัดลอกลิงก์ได้');
        }
        document.body.removeChild(textArea);
    }

    btnCopy.addEventListener('click', copyLinkToClipboard);

    btnReset.addEventListener('click', () => {
        projectNameInput.value = '';
        qrSection.classList.add('hidden');
        formCard.classList.remove('hidden');
        formCard.scrollIntoView({ behavior: 'smooth' });
    });
});
