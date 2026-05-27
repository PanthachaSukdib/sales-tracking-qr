// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const statQrCreated = document.getElementById('stat-qr-created');
    const statSurveys = document.getElementById('stat-surveys');
    const statResponseRate = document.getElementById('stat-response-rate');
    const statAvgScore = document.getElementById('stat-avg-score');

    const statPendingBadge = document.getElementById('stat-pending-badge');
    const pendingList = document.getElementById('pending-list');
    const qrList = document.getElementById('qr-list');
    const surveyList = document.getElementById('survey-list');
    const scoreList = document.getElementById('score-list');

    const employeeTbody = document.getElementById('employee-tbody');
    const recentTbody = document.getElementById('recent-tbody');
    const pendingTbody = document.getElementById('pending-tbody');



    const filterToday = document.getElementById('filter-today');
    const filter7d = document.getElementById('filter-7d');
    const filter30d = document.getElementById('filter-30d');
    const filterMonth = document.getElementById('filter-month');
    
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    
    const btnExport = document.getElementById('btn-export');
    const toast = document.getElementById('toast');

    // Sorting State
    let employeeData = [];
    let sortColumn = 'avg_score';
    let sortAscending = false; // default to desc (highest rating first)

    // --- Toast Notification Helper ---
    let toastTimeout = null;
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // --- Helper: Format ISO date string into Thai localized short string ---
    function formatThaiDateTime(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        
        const thaiMonths = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // Convert to Buddhist Era (BE)
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day} ${month} ${year} (${hours}:${minutes} น.)`;
    }

    // --- Helper: Format Dates to YYYY-MM-DD ---
    function formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Calculate Presets & Set Inputs ---
    function setDateRangePreset(preset) {
        const today = new Date();
        let fromDate = new Date();

        switch (preset) {
            case 'today':
                fromDate = today;
                break;
            case '7d':
                fromDate.setDate(today.getDate() - 7);
                break;
            case '30d':
                fromDate.setDate(today.getDate() - 30);
                break;
            case 'month':
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            default:
                break;
        }

        dateFromInput.value = formatDateString(fromDate);
        dateToInput.value = formatDateString(today);
    }

    // --- Set default filter to 30 Days on load ---
    setDateRangePreset('30d');

    // --- Preset Button Event Binding ---
    const presetButtons = [
        { btn: filterToday, name: 'today' },
        { btn: filter7d, name: '7d' },
        { btn: filter30d, name: '30d' },
        { btn: filterMonth, name: 'month' }
    ];

    presetButtons.forEach(({ btn, name }) => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(x => x.btn.classList.remove('active'));
            btn.classList.add('active');
            setDateRangePreset(name);
            loadData();
        });
    });

    // --- Custom Date Range Changes ---
    [dateFromInput, dateToInput].forEach(input => {
        input.addEventListener('change', () => {
            // Remove active status from all preset buttons as this is custom
            presetButtons.forEach(x => x.btn.classList.remove('active'));
            loadData();
        });
    });

    // --- Sort Table Event Listeners ---
    const sortingHeaders = [
        { element: document.getElementById('th-emp-id'), field: 'employee_id' },
        { element: document.getElementById('th-emp-name'), field: 'employee_name' },
        { element: document.getElementById('th-responses'), field: 'responses' },
        { element: document.getElementById('th-avg-score'), field: 'avg_score' }
    ];

    sortingHeaders.forEach(({ element, field }) => {
        if (element) {
            element.addEventListener('click', () => {
                if (sortColumn === field) {
                    sortAscending = !sortAscending;
                } else {
                    sortColumn = field;
                    sortAscending = field === 'employee_id' || field === 'employee_name'; // asc by default for strings, desc for numbers
                }
                renderEmployeeTable();
            });
        }
    });

    // --- Fetch Dashboard Aggregates ---
    async function loadData() {
        const from = dateFromInput.value;
        const to = dateToInput.value;

        if (!from || !to) return;

        try {
            const response = await fetch(`/api/reports/summary?from=${from}&to=${to}`);
            
            // Handles browser basic auth fallback on unauthorized
            if (response.status === 401) {
                showToast('ต้องการการยืนยันตัวตนเพื่อเข้าถึงหน้าแดชบอร์ด');
                return;
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'เกิดข้อผิดพลาดในการโหลดรายงาน');
            }

            const data = await response.json();
            
            // Update Stats Box
            statQrCreated.textContent = data.totals.qr_generated.toLocaleString();
            statSurveys.textContent = data.totals.surveys_received.toLocaleString();
            statResponseRate.textContent = `${data.totals.response_rate}%`;
            statAvgScore.textContent = data.totals.avg_score.toFixed(1);

            // Update Question Averages
            if (data.question_stats) {
                document.getElementById('qs-q1').textContent = data.question_stats.q1.toFixed(1);
                document.getElementById('qs-q2').textContent = data.question_stats.q2.toFixed(1);
                document.getElementById('qs-q3').textContent = data.question_stats.q3.toFixed(1);
                document.getElementById('qs-q4').textContent = data.question_stats.q4.toFixed(1);
            }

            // Render Improvement Bars
            const barsContainer = document.getElementById('improvement-bars-container');
            if (barsContainer && data.improvement_bars) {
                barsContainer.innerHTML = '';
                if (data.improvement_bars.length === 0) {
                    barsContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 12px 0;">ไม่มีข้อมูลสิ่งที่ต้องปรับปรุง</p>';
                } else {
                    data.improvement_bars.forEach(bar => {
                        barsContainer.innerHTML += `
                            <div class="bar-row">
                                <div class="bar-label">${escapeHTML(bar.label)}</div>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${bar.percent}%; background-color: var(--primary);"></div>
                                </div>
                                <div class="bar-percent">${bar.count}</div>
                            </div>
                        `;
                    });
                }
            }

            // Render Text Feedback
            const textFeedbackContainer = document.getElementById('text-feedback-container');
            if (textFeedbackContainer && data.text_feedback) {
                textFeedbackContainer.innerHTML = '';
                if (data.text_feedback.length === 0) {
                    textFeedbackContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 12px 0;">ไม่มีข้อเสนอแนะ</p>';
                } else {
                    data.text_feedback.forEach(fb => {
                        const dateStr = formatThaiDateTime(fb.date);
                        textFeedbackContainer.innerHTML += `
                            <div class="feedback-card">
                                <div class="feedback-header">
                                    <span class="feedback-date">${dateStr}</span>
                                </div>
                                <div class="feedback-text">"${escapeHTML(fb.text)}"</div>
                            </div>
                        `;
                    });
                }
            }



            // Tooltip 1: QR Created
            qrList.innerHTML = '';
            if (data.recent_qr && data.recent_qr.length > 0) {
                data.recent_qr.slice(0, 15).forEach(q => {
                    const li = document.createElement('li');
                    li.style.borderBottom = '1px solid #F3F4F6';
                    li.style.paddingBottom = '4px';
                    li.innerHTML = `<strong>${escapeHTML(q.customer_name || 'ไม่ระบุลูกค้า')}</strong> <br><span style="font-size: 11px; color: #9CA3AF;">เซลล์: ${escapeHTML(q.employee_name)} | ${escapeHTML(q.project_name || '-')}</span>`;
                    qrList.appendChild(li);
                });
            } else {
                qrList.innerHTML = '<li style="text-align: center; padding: 8px 0;">ไม่มีประวัติการสร้าง QR 📉</li>';
            }

            // Tooltip 2: Surveys Received
            surveyList.innerHTML = '';
            if (data.recent_responses && data.recent_responses.length > 0) {
                data.recent_responses.slice(0, 15).forEach(s => {
                    const li = document.createElement('li');
                    li.style.borderBottom = '1px solid #F3F4F6';
                    li.style.paddingBottom = '4px';
                    li.innerHTML = `<strong>${escapeHTML(s.customer_name || 'ไม่ระบุลูกค้า')}</strong> <br><span style="font-size: 11px; color: #9CA3AF;">เซลล์: ${escapeHTML(s.employee_name)} | ${escapeHTML(s.project_name || '-')}</span>`;
                    surveyList.appendChild(li);
                });
            } else {
                surveyList.innerHTML = '<li style="text-align: center; padding: 8px 0;">ไม่มีประวัติการตอบ 📉</li>';
            }

            // Tooltip 3: Pending Surveys Hover UI
            if (data.totals.pending_count > 0) {
                statPendingBadge.textContent = `รอตอบ: ${data.totals.pending_count}`;
                statPendingBadge.style.display = 'inline-block';
            } else {
                statPendingBadge.style.display = 'none';
            }

            pendingList.innerHTML = '';
            if (data.pending_customers && data.pending_customers.length > 0) {
                data.pending_customers.slice(0, 15).forEach(p => {
                    const li = document.createElement('li');
                    li.style.borderBottom = '1px solid #F3F4F6';
                    li.style.paddingBottom = '4px';
                    li.innerHTML = `<strong>${escapeHTML(p.customer_name || 'ไม่ระบุลูกค้า')}</strong> <br><span style="font-size: 11px; color: #9CA3AF;">เซลล์: ${escapeHTML(p.employee_name)} | ${escapeHTML(p.project_name || '-')}</span>`;
                    pendingList.appendChild(li);
                });
            } else {
                pendingList.innerHTML = '<li style="text-align: center; padding: 8px 0;">ไม่มีลูกค้าค้างตอบ 🎉</li>';
            }

            // Tooltip 4: Avg Score (Recent Scores)
            scoreList.innerHTML = '';
            if (data.recent_responses && data.recent_responses.length > 0) {
                data.recent_responses.slice(0, 15).forEach(s => {
                    const li = document.createElement('li');
                    li.style.borderBottom = '1px solid #F3F4F6';
                    li.style.paddingBottom = '4px';
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'flex-start';
                    const scoreColor = s.score >= 4 ? '#0F6E56' : (s.score === 3 ? '#F59E0B' : '#DC2626');
                    li.innerHTML = `
                        <div>
                            <strong>${escapeHTML(s.customer_name || 'ไม่ระบุลูกค้า')}</strong> <br>
                            <span style="font-size: 11px; color: #9CA3AF;">${escapeHTML(s.employee_name)}</span>
                        </div>
                        <div style="color: ${scoreColor}; font-weight: bold; font-size: 14px;">
                            ${s.score} ★
                        </div>
                    `;
                    scoreList.appendChild(li);
                });
            } else {
                scoreList.innerHTML = '<li style="text-align: center; padding: 8px 0;">ไม่มีข้อมูลคะแนน 📉</li>';
            }

            // Store Employee Breakdown for sorting
            employeeData = data.by_employee || [];
            renderEmployeeTable();

            // Populate Pending Customers Table
            const pendingCustomers = data.pending_customers || [];
            pendingTbody.innerHTML = '';

            if (pendingCustomers.length === 0) {
                pendingTbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center" style="color: var(--text-secondary); padding: 32px 0;">
                            ไม่มีลูกค้าค้างในระบบขณะนี้ 🎉
                        </td>
                    </tr>
                `;
            } else {
                pendingCustomers.forEach(row => {
                    const tr = document.createElement('tr');
                    const formattedDate = formatThaiDateTime(row.created_at);
                    const statusClass = `status-badge ${row.status_code || 'scanned-only'}`;

                    tr.innerHTML = `
                        <td style="color: var(--text-secondary); white-space: nowrap;">${formattedDate}</td>
                        <td><strong>${escapeHTML(row.customer_name || '-')}</strong></td>
                        <td>${escapeHTML(row.project_name || '-')}</td>
                        <td>${escapeHTML(row.employee_name || '-')}</td>
                        <td style="text-align: center;">
                            <span class="${statusClass}">${escapeHTML(row.status || 'สแกนแล้ว')}</span>
                        </td>
                    `;
                    pendingTbody.appendChild(tr);
                });
            }

            // Populate Recent Submissions
            const recentResponses = data.recent_responses || [];
            recentTbody.innerHTML = '';

            if (recentResponses.length === 0) {
                recentTbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center" style="color: var(--text-secondary); padding: 32px 0;">
                            ไม่มีผลการประเมินล่าสุดในช่วงเวลานี้
                        </td>
                    </tr>
                `;
            } else {
                recentResponses.forEach(row => {
                    const tr = document.createElement('tr');
                    
                    // Highlight row in soft red background if score is <= 2 (low score alert)
                    if (row.score <= 2) {
                        tr.classList.add('tr-alert-low-score');
                    }

                    const badgeClass = `score-badge score-${row.score}`;
                    const formattedDate = formatThaiDateTime(row.submitted_at);
                    const safeSuggestion = row.suggestions 
                        ? `<span style="color: var(--text-primary); font-weight: 450;">${escapeHTML(row.suggestions)}</span>`
                        : `<span style="color: #9CA3AF; font-style: italic;">ไม่มีข้อเสนอแนะ</span>`;

                    tr.innerHTML = `
                        <td style="color: var(--text-secondary); white-space: nowrap;">${formattedDate}</td>
                        <td><strong>${escapeHTML(row.employee_name)}</strong> <span class="caption">(${escapeHTML(row.employee_id)})</span></td>
                        <td>${escapeHTML(row.project_name || '-')}</td>
                        <td>${escapeHTML(row.customer_name || '-')}</td>
                        <td style="text-align: center;">
                            <span class="${badgeClass}">${row.score}</span>
                        </td>
                        <td>${safeSuggestion}</td>
                    `;
                    recentTbody.appendChild(tr);
                });
            }

        } catch (error) {
            console.error('Fetch dashboard details failed:', error);
            showToast(error.message || 'ไม่สามารถโหลดข้อมูลสถิติได้');
        }
    }

    // --- HTML Escaping Helper ---
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- Render Sorted Employee Performance Table ---
    function renderEmployeeTable() {
        employeeTbody.innerHTML = '';

        if (employeeData.length === 0) {
            employeeTbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center" style="color: var(--text-secondary); padding: 32px 0;">
                        ไม่มีข้อมูลคะแนนพนักงานในช่วงเวลานี้
                    </td>
                </tr>
            `;
            return;
        }

        // Sort data based on column state
        const sorted = [...employeeData].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            // Handle string vs numeric differences
            if (typeof valA === 'string') {
                return sortAscending 
                    ? valA.localeCompare(valB, 'th') 
                    : valB.localeCompare(valA, 'th');
            } else {
                return sortAscending ? valA - valB : valB - valA;
            }
        });

        sorted.forEach(row => {
            const tr = document.createElement('tr');
            
            // Build visual colored badge for score ranges
            let badgeStyle = '';
            if (row.avg_score >= 4.0) {
                badgeStyle = 'background-color: var(--primary-light); color: var(--primary);';
            } else if (row.avg_score >= 3.0) {
                badgeStyle = 'background-color: #FEF3C7; color: #D97706;'; // orange light
            } else {
                badgeStyle = 'background-color: #FEE2E2; color: #DC2626;'; // red light
            }

            tr.innerHTML = `
                <td><code>${escapeHTML(row.employee_id)}</code></td>
                <td><strong>${escapeHTML(row.employee_name)}</strong></td>
                <td style="text-align: center;">${row.responses.toLocaleString()}</td>
                <td style="text-align: center;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 13px; ${badgeStyle}">
                        ${row.avg_score.toFixed(1)} ★
                    </span>
                </td>
            `;
            employeeTbody.appendChild(tr);
        });
    }

    // --- Export Data to CSV (with Thai BOM character support) ---
    btnExport.addEventListener('click', () => {
        if (employeeData.length === 0) {
            showToast('ไม่มีข้อมูลพนักงานเพื่อจัดทำไฟล์ดาวน์โหลด');
            return;
        }

        let csvContent = 'รหัสพนักงาน,ชื่อพนักงาน,จำนวนผู้ประเมิน,คะแนนเฉลี่ย\n';
        
        employeeData.forEach(row => {
            csvContent += `"${row.employee_id}","${row.employee_name}",${row.responses},${row.avg_score.toFixed(1)}\n`;
        });

        // Add Byte Order Mark (BOM) to force Microsoft Excel to read file as UTF-8 Thai correctly
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const from = dateFromInput.value;
        const to = dateToInput.value;

        link.setAttribute('href', url);
        link.setAttribute('download', `รายงานคะแนนประเมิน_${from}_ถึง_${to}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('ดาวน์โหลดรายงาน CSV สำเร็จ!');
    });

    // --- Trigger Data Fetch ---
    loadData();

    // --- Auto refresh dashboard numbers every 60 seconds ---
    setInterval(loadData, 60000);
});
