// public/js/qr-generator.js

let employeeData = {};
let selectedCustomer = '';
let generatedSurveyUrl = '';

async function loadEmployeeData() {
    try {
        const res = await fetch('/data/employees.json');
        employeeData = await res.json();
        
        // Merge with custom saved employees from LocalStorage
        const saved = JSON.parse(localStorage.getItem('customEmployees') || '{}');
        employeeData = { ...employeeData, ...saved };
        
        console.log('Loaded', Object.keys(employeeData).length, 'employees (including custom)');
    } catch (err) {
        console.warn('Could not load employee data:', err);
        employeeData = {};
    }
}

function setupAutoFill() {
    const listDiv = document.getElementById('empAutocompleteList');
    function closeAllLists(elmnt) {
        if (!listDiv) return;
        listDiv.innerHTML = '';
    }
    
    document.addEventListener('click', function(e) {
        if (e.target !== document.getElementById('empId')) {
            closeAllLists();
        }
    });
    const empIdInput = document.getElementById('empId');
    const empNameInput = document.getElementById('empName');
    const jobInput = document.getElementById('jobNumberInput');
    const jobSelect = document.getElementById('jobNumberSelect');
    const customerInfo = document.getElementById('customerInfo');
    const customerDisplay = document.getElementById('customerDisplay');

    if (!empIdInput) return;

    empIdInput.addEventListener('input', function() {
        let val = this.value.trim();
        
        // Autocomplete Logic
        if (listDiv) {
            listDiv.innerHTML = '';
            if (val) {
                const matches = [];
                for (const [id, emp] of Object.entries(employeeData)) {
                    if (id.toLowerCase().includes(val.toLowerCase()) || emp.name.toLowerCase().includes(val.toLowerCase())) {
                        matches.push({ id, name: emp.name });
                    }
                }
                matches.forEach(match => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerHTML = `<strong>${match.id}</strong> - ${match.name}`;
                    item.addEventListener('click', function() {
                        empIdInput.value = match.id;
                        closeAllLists();
                        empIdInput.dispatchEvent(new Event('input'));
                    });
                    listDiv.appendChild(item);
                });
            }
        }

        const empId = val.toUpperCase();
        const employee = employeeData[empId];

        customerInfo.hidden = true;
        selectedCustomer = '';

        if (employee) {
            empNameInput.value = employee.name;
            empNameInput.classList.add('autofilled');

            if (employee.jobs && employee.jobs.length > 0) {
                jobInput.hidden = true;
                jobInput.value = '';
                jobSelect.hidden = false;
                jobSelect.value = '';
                jobSelect.innerHTML = '<option value="">-- เลือก JOB --</option>';

                employee.jobs.forEach(job => {
                    const opt = document.createElement('option');
                    opt.value = job.jobNumber;
                    opt.textContent = job.jobNumber;
                    opt.dataset.customer = job.customer;
                    jobSelect.appendChild(opt);
                });
            } else {
                // Keep input as text if no jobs remembered yet
                jobSelect.hidden = true;
                jobInput.hidden = false;
            }

            showToast(`พบข้อมูล: ${employee.name}`, 1800);
        } else {
            empNameInput.classList.remove('autofilled');
            jobSelect.hidden = true;
            jobInput.hidden = false;
        }
    });

    jobSelect.addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        const customer = opt.dataset.customer || '';

        if (customer) {
            selectedCustomer = customer;
            customerDisplay.textContent = customer;
            customerInfo.hidden = false;
        } else {
            selectedCustomer = '';
            customerInfo.hidden = true;
        }
    });

    jobInput.addEventListener('input', function() {
        selectedCustomer = '';
        customerInfo.hidden = true;
    });
}

function showCustomPrompt() {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-prompt-modal');
        const input = document.getElementById('custom-prompt-input');
        const btnOk = document.getElementById('custom-prompt-ok');
        const btnCancel = document.getElementById('custom-prompt-cancel');

        if (!modal) {
            // fallback if modal not found
            resolve(prompt('กรุณากรอกชื่อลูกค้า/โครงการ:'));
            return;
        }

        input.value = '';
        modal.hidden = false;
        input.focus();

        const cleanup = () => {
            modal.hidden = true;
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            input.removeEventListener('keydown', onEnter);
        };

        const onOk = () => { cleanup(); resolve(input.value); };
        const onCancel = () => { cleanup(); resolve(null); };
        const onEnter = (e) => { if (e.key === 'Enter') onOk(); };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
        input.addEventListener('keydown', onEnter);
    });
}

function setupFormSubmit() {
    const form = document.getElementById('qrForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const jobSelect = document.getElementById('jobNumberSelect');
        const jobInput = document.getElementById('jobNumberInput');
        const jobValue = !jobSelect.hidden ? jobSelect.value : jobInput.value.trim();

        const data = {
            empId: document.getElementById('empId').value.trim().toUpperCase(),
            empName: document.getElementById('empName').value.trim(),
            projectName: jobValue,
            customerName: selectedCustomer || ''
        };

        if (!data.empId || !data.empName || !data.projectName) {
            showToast('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        if (!data.customerName) {
            const manual = await showCustomPrompt();
            if (!manual || !manual.trim()) {
                showToast('ต้องกรอกชื่อลูกค้า/โครงการ');
                return;
            }
            data.customerName = manual.trim();
        }

        await createAndDisplayQR(data);
        
        // Save new employee and job to localStorage memory
        const customEmployees = JSON.parse(localStorage.getItem('customEmployees') || '{}');
        const emp = customEmployees[data.empId] || { name: data.empName, jobs: [] };
        
        // Ensure name is up to date
        emp.name = data.empName;

        // Add job if it doesn't exist in memory
        const jobExists = emp.jobs.find(j => j.jobNumber === data.projectName);
        if (!jobExists) {
            emp.jobs.push({ jobNumber: data.projectName, customer: data.customerName });
        }
        
        customEmployees[data.empId] = emp;
        localStorage.setItem('customEmployees', JSON.stringify(customEmployees));
        
        // Update current session memory
        if (!employeeData[data.empId]) {
            employeeData[data.empId] = { ...emp };
        } else {
            // Also push to standard memory so they don't have to refresh if they generate another one right away
            if (!employeeData[data.empId].jobs) employeeData[data.empId].jobs = [];
            if (!employeeData[data.empId].jobs.find(j => j.jobNumber === data.projectName)) {
                employeeData[data.empId].jobs.push({ jobNumber: data.projectName, customer: data.customerName });
            }
        }
    });
}

async function createAndDisplayQR(data) {
    const btnGenerate = document.querySelector('.btn-create-qr');
    if (btnGenerate) {
        btnGenerate.disabled = true;
        btnGenerate.textContent = 'กำลังสร้าง QR Code...';
    }

    try {
        cleanupQrSection();

        const QR_REDIRECT_BASE = window.QR_REDIRECT_BASE || '/scan.html';
        const baseUrl = QR_REDIRECT_BASE.startsWith('http')
            ? QR_REDIRECT_BASE
            : window.location.origin + QR_REDIRECT_BASE;
        
        const tempParams = new URLSearchParams({
            emp_id: data.empId,
            emp_name: data.empName,
            project: data.projectName,
            customer: data.customerName
        });
        const tempUrl = `${baseUrl}?${tempParams.toString()}`;

        let finalUrl = tempUrl;
        let displayData = { ...data };
        let isDuplicate = false;

        try {
            const response = await fetch('/api/qr-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: data.empId,
                    employee_name: data.empName,
                    project_name: data.projectName,
                    customer_name: data.customerName,
                    generated_url: tempUrl
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
                        customerName: resData.customer_name || data.customerName
                    };
                }
            }
        } catch (err) {
            console.warn('Failed to communicate with qr-logs backend:', err);
        }

        generatedSurveyUrl = finalUrl;

        const newCanvas = document.getElementById('qr-canvas');
        if (newCanvas) {
            await renderQR(newCanvas, generatedSurveyUrl);
        }

        const displayEmpId = document.getElementById('displayEmpId');
        const displayEmpName = document.getElementById('displayEmpName');
        const displayProject = document.getElementById('displayProject');
        const displayCustomer = document.getElementById('displayCustomer');
        if (displayEmpId) displayEmpId.textContent = displayData.empId;
        if (displayEmpName) displayEmpName.textContent = displayData.empName;
        if (displayProject) displayProject.textContent = displayData.projectName;
        if (displayCustomer) displayCustomer.textContent = displayData.customerName;

        const formCard = document.querySelector('.qr-card');
        const qrSection = document.getElementById('qr-section');
        
        if (formCard) formCard.hidden = true;
        if (qrSection) {
            qrSection.hidden = false;
            qrSection.classList.remove('hidden'); // keep for backward compatibility
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        localStorage.setItem('sst_employee', JSON.stringify({
            empId: data.empId,
            empName: data.empName
        }));

        if (isDuplicate) {
            showToast('พบชื่อโครงการ / เลข Job นี้ในระบบแล้ว ดึงข้อมูล QR Code เดิม', 4000);
        } else {
            showToast('สร้าง QR Code สำเร็จ!');
        }

    } catch (error) {
        console.error('QR Generation error:', error);
        showToast('ไม่สามารถสร้าง QR Code ได้');
    } finally {
        if (btnGenerate) {
            btnGenerate.disabled = false;
            btnGenerate.textContent = 'สร้าง QR Code';
        }
    }
}

function cleanupQrSection() {
    const container = document.querySelector('.qr-canvas-container');
    if (container) {
        container.innerHTML = '<canvas id="qr-canvas"></canvas>';
    }
    const displayEmpId = document.getElementById('displayEmpId');
    const displayEmpName = document.getElementById('displayEmpName');
    const displayProject = document.getElementById('displayProject');
    const displayCustomer = document.getElementById('displayCustomer');
    if (displayEmpId) displayEmpId.textContent = '-';
    if (displayEmpName) displayEmpName.textContent = '-';
    if (displayProject) displayProject.textContent = '-';
    if (displayCustomer) displayCustomer.textContent = '-';
}

async function renderQR(canvas, url) {
    if (typeof QRCode === 'undefined') return;
    await QRCode.toCanvas(canvas, url, {
        width: 240,
        margin: 1,
        color: { dark: '#0F6E56', light: '#FFFFFF' },
        errorCorrectionLevel: 'M'
    });

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

    if (window.InAppBrowser && window.InAppBrowser.detect()) {
        img.style.opacity = '1';
        img.style.pointerEvents = 'auto';
        canvas.style.opacity = '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEmployeeData().then(() => {
        setupAutoFill();
        setupFormSubmit();
        
        const saved = localStorage.getItem('sst_employee');
        if (saved) {
            try {
                const emp = JSON.parse(saved);
                if (emp.empId) {
                    const empIdInput = document.getElementById('empId');
                    if (empIdInput) {
                        empIdInput.value = emp.empId;
                        empIdInput.dispatchEvent(new Event('input'));
                    }
                }
            } catch {}
        }
    });

    const btnSave = document.getElementById('btn-save');
    const btnShare = document.getElementById('btn-share');
    const btnCopy = document.getElementById('btn-copy');
    const btnReset = document.getElementById('btn-reset');
    
    if (btnSave) {
        btnSave.addEventListener('click', async function() {
            const canvas = document.getElementById('qr-canvas');
            if (!canvas) return;

            const inApp = window.InAppBrowser && window.InAppBrowser.detect();
            const isAndroid = window.InAppBrowser && window.InAppBrowser.isAndroid();

            if (inApp && isAndroid) {
                showToast('กดค้างที่ QR Code ด้านบน → เลือก "บันทึกรูปภาพ"', 4000);
                return;
            }

            try {
                const targetFrame = document.querySelector('.qr-dashed-frame');
                if (!targetFrame) {
                    showToast('ไม่พบกรอบ QR Code', 2000);
                    return;
                }
                
                // แจ้งเตือนก่อนเริ่มแคปจอเพราะอาจจะใช้เวลาเล็กน้อย
                showToast('กำลังประมวลผลรูปภาพ...', 1500);

                const canvasFrame = await html2canvas(targetFrame, {
                    scale: 2, // ความคมชัดสูง 2 เท่า
                    backgroundColor: '#FFFFFF',
                    useCORS: true
                });

                const link = document.createElement('a');
                const empId = document.getElementById('displayEmpId').textContent || 'qr';
                const safeName = empId.replace(/[^a-zA-Z0-9_-]/g, '');
                link.download = `SST_QR_${safeName}_${Date.now()}.png`;
                link.href = canvasFrame.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => showToast('บันทึกรูปภาพเรียบร้อยแล้ว!', 2000), 1000);
            } catch (err) {
                console.error(err);
                showToast('ไม่สามารถบันทึกได้ กรุณากดค้างที่ QR Code');
            }
        });
    }

    if (btnShare) {
        btnShare.addEventListener('click', async function() {
            const canvas = document.getElementById('qr-canvas');
            if (!canvas) return;

            const empName = document.getElementById('displayEmpName').textContent || '';
            const project = document.getElementById('displayProject').textContent || '';
            const customer = document.getElementById('displayCustomer').textContent || '';
            const shareText = `แบบประเมินความพึงพอใจจาก ${empName}\nJOB-Number: ${project}\nชื่อลูกค้า/โครงการ: ${customer}\n\nกรุณาสแกน QR หรือคลิกลิงก์`;

            const inApp = window.InAppBrowser && window.InAppBrowser.detect();
            const isAndroid = window.InAppBrowser && window.InAppBrowser.isAndroid();

            if (inApp && isAndroid) {
                try {
                    await navigator.clipboard.writeText(generatedSurveyUrl);
                    showToast('คัดลอกลิงก์แล้ว — ไปวางในแอปที่ต้องการแชร์', 3500);
                } catch {
                    showToast('กรุณาเปิดในเบราว์เซอร์เพื่อใช้งานการแชร์');
                }
                return;
            }

            try {
                showToast('กำลังเตรียมรูปภาพเพื่อแชร์...', 1000);
                const targetFrame = document.querySelector('.qr-dashed-frame');
                const canvasFrame = targetFrame ? await html2canvas(targetFrame, {
                    scale: 2,
                    backgroundColor: '#FFFFFF',
                    useCORS: true
                }) : canvas;

                const blob = await new Promise(resolve => canvasFrame.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'SST_QR_Survey.png', { type: 'image/png' });

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

                await navigator.clipboard.writeText(generatedSurveyUrl);
                showToast('คัดลอกลิงก์แล้ว — ไปวางในแอปที่ต้องการแชร์', 3500);
            } catch (err) {
                if (err && err.name !== 'AbortError') {
                    try {
                        await navigator.clipboard.writeText(generatedSurveyUrl);
                        showToast('คัดลอกลิงก์แล้ว', 3000);
                    } catch {
                        showToast('แชร์ไม่สำเร็จ');
                    }
                }
            }
        });
    }

    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            if (!generatedSurveyUrl) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(generatedSurveyUrl)
                    .then(() => showToast('คัดลอกลิงก์สำเร็จ!'))
                    .catch(() => fallbackCopyText(generatedSurveyUrl));
            } else {
                fallbackCopyText(generatedSurveyUrl);
            }
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            const empIdInput = document.getElementById('empId');
            const empNameInput = document.getElementById('empName');
            if (empIdInput) empIdInput.value = '';
            if (empNameInput) {
                empNameInput.value = '';
                empNameInput.classList.remove('autofilled');
            }
            
            const jobSelect = document.getElementById('jobNumberSelect');
            const jobInput = document.getElementById('jobNumberInput');
            if (jobSelect) {
                jobSelect.value = '';
                jobSelect.hidden = true;
            }
            if (jobInput) {
                jobInput.value = '';
                jobInput.hidden = false;
            }
            
            const customerInfo = document.getElementById('customerInfo');
            if (customerInfo) customerInfo.hidden = true;
            selectedCustomer = '';
            
            localStorage.removeItem('sst_employee');
            cleanupQrSection();
            
            const qrSection = document.getElementById('qr-section');
            const formCard = document.querySelector('.qr-card');
            if (qrSection) {
                qrSection.hidden = true;
                qrSection.classList.add('hidden'); // backward compatibility
            }
            if (formCard) {
                formCard.hidden = false;
                formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            setTimeout(() => {
                if (empIdInput) empIdInput.focus();
            }, 350);
        });
    }

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

let toastTimeout = null;
function showToast(msg, duration = 2000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-container';
        document.body.appendChild(toast);
    }
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
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
