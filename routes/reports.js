const express = require('express');
const router = express.Router();
const { getAllRowsAsObjects } = require('../db/sheets-client');

// Simple Basic Auth Middleware for Reports
const basicAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
        return res.status(401).send('Authentication required');
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user === process.env.DASHBOARD_USER && pass === process.env.DASHBOARD_PASS) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard"');
        res.status(401).send('Invalid credentials');
    }
};

router.get('/summary', basicAuthMiddleware, async (req, res) => {
    const { from, to } = req.query;
    
    try {
        const [qrLogs, surveys, events] = await Promise.all([
            getAllRowsAsObjects('qr_logs'),
            getAllRowsAsObjects('survey_results'),
            getAllRowsAsObjects('events').catch(err => {
                console.warn('Failed to fetch events from Google Sheets, using empty list:', err);
                return [];
            })
        ]);

        // Filter by date range if provided
        const filterByDate = (rows, dateField) => {
            if (!from && !to) return rows;
            return rows.filter(r => {
                const val = r[dateField];
                if (!val) return false;
                const d = new Date(val);
                if (isNaN(d.getTime())) return false;
                if (from && d < new Date(from)) return false;
                if (to && d > new Date(to + 'T23:59:59')) return false;
                return true;
            });
        };

        const filteredQR = filterByDate(qrLogs, 'created_at');
        const filteredSurveys = filterByDate(surveys, 'submitted_at');
        const filteredEvents = filterByDate(events, 'timestamp');

        // Basic Totals
        const qr_generated = filteredQR.length;
        const surveys_received = filteredSurveys.length;
        const response_rate = qr_generated > 0
            ? Math.round((surveys_received / qr_generated) * 1000) / 10
            : 0;
        const scores = filteredSurveys.map(s => parseInt(s.satisfaction_score)).filter(n => !isNaN(n));
        const avg_score = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
            : 0;

        // By employee
        const empMap = {};
        filteredSurveys.forEach(s => {
            const key = s.employee_id;
            if (!key) return;
            if (!empMap[key]) {
                empMap[key] = {
                    employee_id: key,
                    employee_name: s.employee_name,
                    responses: 0,
                    total_score: 0
                };
            }
            empMap[key].responses++;
            empMap[key].total_score += parseInt(s.satisfaction_score) || 0;
        });
        const by_employee = Object.values(empMap)
            .map(e => ({
                employee_id: e.employee_id,
                employee_name: e.employee_name,
                responses: e.responses,
                avg_score: Math.round((e.total_score / e.responses) * 100) / 100
            }))
            .sort((a, b) => b.avg_score - a.avg_score);

        // --- Calculate Funnel and Detailed Pending (using events table) ---
        let scanned_count = 0;
        let survey_count = 0;
        let forms_opened_count = 0;
        let skipped_count = 0;
        let pending_customers = [];

        if (filteredEvents.length > 0) {
            // Group events by session_id
            const sessionsMap = {};
            filteredEvents.forEach(evt => {
                const sid = evt.session_id;
                if (!sid) return;
                if (!sessionsMap[sid]) {
                    sessionsMap[sid] = {
                        session_id: sid,
                        scanned: false,
                        survey_submitted: false,
                        ms_forms_opened: false,
                        skipped_ms_forms: false,
                        employee_id: evt.employee_id || '',
                        employee_name: evt.employee_name || '',
                        customer_name: evt.customer_name || '',
                        project_name: evt.project_name || '',
                        timestamp: evt.timestamp
                    };
                }
                
                if (evt.event_type === 'scanned') {
                    sessionsMap[sid].scanned = true;
                } else if (evt.event_type === 'survey_submitted') {
                    sessionsMap[sid].survey_submitted = true;
                } else if (evt.event_type === 'ms_forms_opened') {
                    sessionsMap[sid].ms_forms_opened = true;
                } else if (evt.event_type === 'skipped_ms_forms') {
                    sessionsMap[sid].skipped_ms_forms = true;
                }
                
                // Track the earliest timestamp (the scan time) as the main session timestamp
                if (new Date(evt.timestamp) < new Date(sessionsMap[sid].timestamp)) {
                    sessionsMap[sid].timestamp = evt.timestamp;
                }
            });

            const sessions = Object.values(sessionsMap);
            scanned_count = sessions.filter(s => s.scanned).length;
            survey_count = sessions.filter(s => s.survey_submitted).length;
            forms_opened_count = sessions.filter(s => s.ms_forms_opened).length;
            skipped_count = sessions.filter(s => s.skipped_ms_forms).length;

            sessions.forEach(s => {
                // If they completed the entire flow (opened MS Forms or skipped it), they are not pending
                if (s.ms_forms_opened || s.skipped_ms_forms) return;

                let status = '';
                let status_code = '';
                if (s.survey_submitted) {
                    status = 'ให้ดาวแล้ว (ยังไม่กรอกฟอร์ม)';
                    status_code = 'survey_done';
                } else if (s.scanned) {
                    status = 'สแกนแล้ว (ยังไม่ให้ดาว)';
                    status_code = 'scanned_only';
                } else {
                    return; // skip if no scan event
                }

                pending_customers.push({
                    employee_name: s.employee_name,
                    project_name: s.project_name,
                    customer_name: s.customer_name,
                    created_at: s.timestamp,
                    status,
                    status_code
                });
            });
        } else {
            // Legacy/Fallback Logic when no Event tracking data is available yet
            scanned_count = qr_generated;
            survey_count = surveys_received;
            forms_opened_count = surveys_received; // In legacy flow, they went to forms next
            skipped_count = 0;

            const surveyKeys = new Set(filteredSurveys.map(s => {
                return `${s.employee_id}_${(s.project_name || '').trim().toLowerCase()}_${(s.customer_name || '').trim().toLowerCase()}`;
            }));

            const pendingMap = {};
            filteredQR.forEach(q => {
                const customerName = (q.customer_name || '').trim();
                if (!customerName) return; 

                const key = `${q.employee_id}_${(q.project_name || '').trim().toLowerCase()}_${customerName.toLowerCase()}`;
                if (!surveyKeys.has(key)) {
                    if (!pendingMap[key] || new Date(q.created_at) > new Date(pendingMap[key].created_at)) {
                        pendingMap[key] = {
                            employee_name: q.employee_name,
                            project_name: q.project_name,
                            customer_name: q.customer_name,
                            created_at: q.created_at,
                            status: 'สแกนแล้ว (ยังไม่ให้ดาว)',
                            status_code: 'scanned_only'
                        };
                    }
                }
            });
            pending_customers = Object.values(pendingMap);
        }

        // Sort pending by date descending
        pending_customers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Recent 20 responses
        const recent_responses = filteredSurveys
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
            .slice(0, 20)
            .map(s => ({
                submitted_at: s.submitted_at,
                employee_name: s.employee_name,
                project_name: s.project_name,
                customer_name: s.customer_name,
                score: parseInt(s.satisfaction_score),
                suggestions: s.suggestions
            }));

        // Recent 20 QR logs
        const recent_qr = filteredQR
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 20)
            .map(q => ({
                created_at: q.created_at,
                employee_name: q.employee_name,
                project_name: q.project_name,
                customer_name: q.customer_name
            }));

        res.json({
            totals: { 
                qr_generated, 
                surveys_received, 
                response_rate, 
                avg_score,
                pending_count: pending_customers.length 
            },
            funnel: {
                scanned: scanned_count,
                survey_submitted: survey_count,
                ms_forms_opened: forms_opened_count,
                skipped: skipped_count
            },
            by_employee,
            recent_responses,
            pending_customers,
            recent_qr
        });
    } catch (err) {
        console.error('Reports failed:', err);
        res.status(500).json({ error: 'Failed to load reports' });
    }
});

module.exports = router;
