// public/js/qr-generator.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const employeeIdInput = document.getElementById('empId');
    const employeeNameInput = document.getElementById('empName');
    const projectNameInput = document.getElementById('projectName');
    const customerNameInput = document.getElementById('customerName');
    const btnGenerate = document.getElementById('btn-generate');
    
    const formCard = document.getElementById('form-card');
    const qrSection = document.getElementById('qr-section');
    const qrCanvas = document.getElementById('qr-canvas');
    
    const displayEmpId = document.getElementById('displayEmpId');
    const displayEmpName = document.getElementById('displayEmpName');
    const displayProject = document.getElementById('displayProject');
    const displayCustomer = document.getElementById('displayCustomer');
    
    const btnSave = document.getElementById('btn-save');
    const btnShare = document.getElementById('btn-share');
    const btnCopy = document.getElementById('btn-copy');
    const btnReset = document.getElementById('btn-reset');
    
    const toast = document.getElementById('toast');

    let generatedSurveyUrl = '';

    // โหลดตอนเปิดหน้า autofill ให้
    const saved = localStorage.getItem('sst_employee');
    if (saved) {
        try {
            const emp = JSON.parse(saved);
            employeeIdInput.value = emp.empId || '';
            employeeNameInput.value = emp.empName || '';
        } catch {}
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
        const data = {
            empId: employeeIdInput.value.trim(),
            empName: employeeNameInput.value.trim(),
            projectName: projectNameInput.value.trim(),
            customerName: customerNameInput.value.trim()
        };

        if (!data.empId || !data.empName || !data.projectName || !data.customerName) {
            showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        // บันทึกหลังกดสร้าง (จำได้ครั้งต่อไป)
        localStorage.setItem('sst_employee', JSON.stringify({
            empId: data.empId,
            empName: data.empName
        }));

        btnGenerate.disabled = true;
        btnGenerate.textContent = 'กำลังสร้าง QR Code...';

        try {
            const QR_REDIRECT_BASE = window.QR_REDIRECT_BASE || '/scan.html';
            const baseUrl = QR_REDIRECT_BASE.startsWith('http')
                ? QR_REDIRECT_BASE
                : window.location.origin + QR_REDIRECT_BASE;
            
            const params = new URLSearchParams({
                emp_id: data.empId,
                emp_name: data.empName,
                project: data.projectName,
                customer: data.customerName
            });
            generatedSurveyUrl = `${baseUrl}?${params.toString()}`;

            await QRCode.toCanvas(qrCanvas, generatedSurveyUrl, {
                width: 240,
                margin: 2,
                color: { dark: '#0F6E56', light: '#FFFFFF' }
            });

            // ส่งข้อมูลไป /api/qr-logs
            try {
                await fetch('/api/qr-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        employee_id: data.empId,
                        employee_name: data.empName,
                        project_name: data.projectName,
                        customer_name: data.customerName,
                        generated_url: generatedSurveyUrl
                    })
                });
            } catch (err) {
                console.warn('Failed to log QR generation:', err);
            }

            displayEmpId.textContent = data.empId;
            displayEmpName.textContent = data.empName;
            displayProject.textContent = data.projectName;
            displayCustomer.textContent = data.customerName;

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
