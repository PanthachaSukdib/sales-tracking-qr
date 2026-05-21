// public/js/qr-generator.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const employeeIdInput = document.getElementById('empId');
    const employeeNameInput = document.getElementById('empName');
    const projectNameInput = document.getElementById('projectName');
    const jobNoInput = document.getElementById('jobNo');
    const customerNameInput = document.getElementById('customerName');
    const btnGenerate = document.getElementById('btn-generate');
    
    const formCard = document.getElementById('form-card');
    const qrSection = document.getElementById('qr-section');
    const qrCanvas = document.getElementById('qr-canvas');
    
    const displayEmpId = document.getElementById('displayEmpId');
    const displayEmpName = document.getElementById('displayEmpName');
    const displayJobNo = document.getElementById('displayJobNo');
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
    function showToast(message, duration = 2200) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ฟังก์ชันทำความสะอาด QR Section และ Canvas container
    function cleanupQrSection() {
        const container = document.querySelector('.qr-canvas-container');
        if (container) {
            container.innerHTML = '<canvas id="qr-canvas"></canvas>';
        }
        
        if (displayEmpId) displayEmpId.textContent = '-';
        if (displayEmpName) displayEmpName.textContent = '-';
        if (displayJobNo) displayJobNo.textContent = '-';
        if (displayProject) displayProject.textContent = '-';
        if (displayCustomer) displayCustomer.textContent = '-';
    }

    // หลังจากสร้าง QR Canvas เสร็จ ให้แปลงเป็น <img> ด้วย เพื่อให้ long-press ได้
    async function renderQR(canvas, url) {
        await QRCode.toCanvas(canvas, url, {
            width: 240,
            margin: 1,
            color: { dark: '#0F6E56', light: '#FFFFFF' },
            errorCorrectionLevel: 'M'
        });

        // สร้าง <img> overlay สำหรับ long-press save (สำคัญสำหรับ Android WebView)
        const dataUrl = canvas.toDataURL('image/png');
        let img = document.getElementById('qr-image-overlay');
        if (!img) {
            img = document.createElement('img');
            img.id = 'qr-image-overlay';
            img.alt = 'QR Code';
            img.width = 240;
            img.height = 240;
            img.style.cssText = `
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                opacity: 0;
                pointer-events: none;
            `;
            canvas.parentElement.style.position = 'relative';
            canvas.parentElement.appendChild(img);
        }
        img.src = dataUrl;

        // ใน WebView ให้ <img> รับ touch event แทน canvas
        if (window.InAppBrowser && window.InAppBrowser.detect()) {
            img.style.opacity = '1';
            img.style.pointerEvents = 'auto';
            canvas.style.opacity = '0';
        }
    }

    btnGenerate.addEventListener('click', async () => {
        const data = {
            empId: employeeIdInput.value.trim(),
            empName: employeeNameInput.value.trim(),
            projectName: projectNameInput.value.trim(),
            jobNo: jobNoInput.value.trim(),
            customerName: customerNameInput.value.trim()
        };

        if (!data.empId || !data.empName || !data.projectName || !data.jobNo || !data.customerName) {
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
            // ทำความสะอาดรูป/canvas และข้อความเก่าทั้งหมดก่อนสร้างใหม่ ป้องกันการซ้อนทับ
            cleanupQrSection();

            const QR_REDIRECT_BASE = window.QR_REDIRECT_BASE || '/scan.html';
            const baseUrl = QR_REDIRECT_BASE.startsWith('http')
                ? QR_REDIRECT_BASE
                : window.location.origin + QR_REDIRECT_BASE;
            
            // คาดการณ์ URL ชั่วคราวก่อน (สำหรับเคสข้อมูลใหม่)
            const tempParams = new URLSearchParams({
                emp_id: data.empId,
                emp_name: data.empName,
                project: data.projectName,
                customer: data.customerName,
                job_no: data.jobNo
            });
            const tempUrl = `${baseUrl}?${tempParams.toString()}`;

            let finalUrl = tempUrl;
            let displayData = { ...data };
            let isDuplicate = false;

            // ตรวจสอบกับเซิร์ฟเวอร์ก่อนว่า เลข Job นี้เคยเจนไปแล้วหรือยัง
            try {
                const response = await fetch('/api/qr-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        employee_id: data.empId,
                        employee_name: data.empName,
                        project_name: data.projectName,
                        customer_name: data.customerName,
                        generated_url: tempUrl,
                        job_number: data.jobNo
                    })
                });

                if (response.ok) {
                    const resData = await response.json();
                    if (resData.already_exists) {
                        isDuplicate = true;
                        finalUrl = resData.generated_url || tempUrl;
                        displayData = {
                            empId: resData.employee_id || data.empId,
                            empName: resData.employee_name || data.empName,
                            projectName: resData.project_name || data.projectName,
                            customerName: resData.customer_name || data.customerName,
                            jobNo: data.jobNo
                        };
                    }
                }
            } catch (err) {
                console.warn('Failed to communicate with qr-logs backend:', err);
            }

            generatedSurveyUrl = finalUrl;

            // ดึง canvas ตัวใหม่ที่ถูกสร้างขึ้นจากการ cleanup เสมอ
            const newCanvas = document.getElementById('qr-canvas');
            await renderQR(newCanvas, generatedSurveyUrl);

            displayEmpId.textContent = displayData.empId;
            displayEmpName.textContent = displayData.empName;
            displayJobNo.textContent = displayData.jobNo;
            displayProject.textContent = displayData.projectName;
            displayCustomer.textContent = displayData.customerName;

            formCard.classList.add('hidden');
            qrSection.classList.remove('hidden');
            
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

            if (isDuplicate) {
                showToast('พบเลข Job นี้ในระบบแล้ว ดึงข้อมูล QR Code เดิม', 4000);
            } else {
                showToast('สร้าง QR Code สำเร็จ!');
            }

        } catch (error) {
            console.error('QR Generation error:', error);
            showToast('ไม่สามารถสร้าง QR Code ได้');
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.textContent = 'สร้าง QR Code';
        }
    });

    // Save button
    btnSave.addEventListener('click', async function() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const inApp = window.InAppBrowser && window.InAppBrowser.detect();
        const isAndroid = window.InAppBrowser && window.InAppBrowser.isAndroid();

        // ถ้าเป็น in-app browser บน Android — บอกให้กดค้างที่รูปแทน
        if (inApp && isAndroid) {
            showToast('กดค้างที่ QR Code ด้านบน → เลือก "บันทึกรูปภาพ"', 4000);
            return;
        }

        // ปกติ: ดาวน์โหลดผ่าน canvas
        try {
            const link = document.createElement('a');
            const empId = document.getElementById('displayEmpId').textContent || 'qr';
            const safeName = empId.replace(/[^a-zA-Z0-9_-]/g, '');
            link.download = `QR_${safeName}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('บันทึกรูปภาพแล้ว');
        } catch (err) {
            console.error(err);
            showToast('ไม่สามารถบันทึกได้ กรุณากดค้างที่ QR Code');
        }
    });

    // Share button — fallback ฉลาดขึ้น
    btnShare.addEventListener('click', async function() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const empName = document.getElementById('displayEmpName').textContent || '';
        const project = document.getElementById('displayProject').textContent || '';
        const customer = document.getElementById('displayCustomer').textContent || '';
        const shareText = `แบบประเมินความพึงพอใจจาก ${empName}\nโครงการ: ${project}\nลูกค้า: ${customer}\n\nกรุณาสแกน QR หรือคลิกลิงก์`;

        const inApp = window.InAppBrowser && window.InAppBrowser.detect();
        const isAndroid = window.InAppBrowser && window.InAppBrowser.isAndroid();

        // ใน Android WebView — Web Share API มักใช้ไม่ได้ → copy ลิงก์ทันที
        if (inApp && isAndroid) {
            try {
                await navigator.clipboard.writeText(generatedSurveyUrl);
                showToast('คัดลอกลิงก์แล้ว — ไปวางในแอปที่ต้องการแชร์', 3500);
            } catch {
                showToast('กรุณาเปิดในเบราว์เซอร์เพื่อใช้งานการแชร์');
            }
            return;
        }

        // ปกติ: ลองแชร์ไฟล์ก่อน
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'QR_Survey.png', { type: 'image/png' });

            if (window.InAppBrowser?.canShareFiles() && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'QR Code แบบประเมิน',
                    text: shareText
                });
                return;
            }

            if (navigator.share) {
                await navigator.share({
                    title: 'QR Code แบบประเมิน',
                    text: shareText,
                    url: generatedSurveyUrl
                });
                return;
            }

            // No share API at all → copy
            await navigator.clipboard.writeText(generatedSurveyUrl);
            showToast('คัดลอกลิงก์แล้ว — ไปวางในแอปที่ต้องการแชร์', 3500);
        } catch (err) {
            if (err && err.name !== 'AbortError') {
                // ลอง copy เป็น fallback ของ fallback
                try {
                    await navigator.clipboard.writeText(generatedSurveyUrl);
                    showToast('คัดลอกลิงก์แล้ว', 3000);
                } catch {
                    showToast('แชร์ไม่สำเร็จ');
                }
            }
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

    // ปุ่มสร้าง QR ใหม่ (Reset ทั้งระบบ)
    btnReset.addEventListener('click', () => {
        // ล้างข้อมูลทุกฟิลด์
        employeeIdInput.value = '';
        employeeNameInput.value = '';
        projectNameInput.value = '';
        jobNoInput.value = '';
        customerNameInput.value = '';
        
        // ลบข้อมูลที่บันทึกไว้ใน localStorage
        localStorage.removeItem('sst_employee');
        
        // ทำความสะอาด QR Section
        cleanupQrSection();
        
        // สลับกลับไปแสดงหน้าฟอร์ม
        qrSection.classList.add('hidden');
        formCard.classList.remove('hidden');
        
        // เลื่อนกลับไปด้านบนอย่างนุ่มนวล
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // โฟกัสที่รหัสพนักงานเพื่อให้เริ่มกรอกใหม่ทั้งหมด
        setTimeout(() => {
            employeeIdInput.focus();
        }, 350);
    });

    // Setup WebView banner
    const inAppApp = window.InAppBrowser && window.InAppBrowser.detect();
    if (inAppApp) {
        const banner = document.getElementById('webview-banner');
        const appName = document.getElementById('webview-app-name');
        if (banner) banner.hidden = false;
        if (appName) appName.textContent = inAppApp;

        const openBtn = document.getElementById('open-in-browser-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                window.InAppBrowser.openInExternalBrowser();
            });
        }
    }
});
