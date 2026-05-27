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

        // Calculate Average Scores for q1-q4
        let sumQ1 = 0, sumQ2 = 0, sumQ3 = 0, sumQ4 = 0;
        let countQ1 = 0, countQ2 = 0, countQ3 = 0, countQ4 = 0;
        
        // Improvement frequencies
        const impFreq = {};
        
        filteredSurveys.forEach(s => {
            const q1 = parseInt(s.score_q1);
            const q2 = parseInt(s.score_q2);
            const q3 = parseInt(s.score_q3);
            const q4 = parseInt(s.score_q4);
            
            if (!isNaN(q1)) { sumQ1 += q1; countQ1++; }
            if (!isNaN(q2)) { sumQ2 += q2; countQ2++; }
            if (!isNaN(q3)) { sumQ3 += q3; countQ3++; }
            if (!isNaN(q4)) { sumQ4 += q4; countQ4++; }
            
            if (s.improvements) {
                const arr = s.improvements.split('|');
                arr.forEach(imp => {
                    const i = imp.trim();
                    if (i) {
                        impFreq[i] = (impFreq[i] || 0) + 1;
                    }
                });
            }
        });

        const avg_q1 = countQ1 > 0 ? sumQ1 / countQ1 : 0;
        const avg_q2 = countQ2 > 0 ? sumQ2 / countQ2 : 0;
        const avg_q3 = countQ3 > 0 ? sumQ3 / countQ3 : 0;
        const avg_q4 = countQ4 > 0 ? sumQ4 / countQ4 : 0;
        
        const totalAvg = (avg_q1 + avg_q2 + avg_q3 + avg_q4) / 4;
        const avg_score = totalAvg || 0; // overall

        // Prepare Improvement Bars data
        const improvementBars = Object.keys(impFreq).map(k => ({
            label: k,
            count: impFreq[k],
            percent: surveys_received > 0 ? Math.round((impFreq[k] / surveys_received) * 100) : 0
        })).sort((a, b) => b.count - a.count);

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
            const avg4 = (!isNaN(s.score_q1) ? parseInt(s.score_q1) : 0) + 
                         (!isNaN(s.score_q2) ? parseInt(s.score_q2) : 0) + 
                         (!isNaN(s.score_q3) ? parseInt(s.score_q3) : 0) + 
                         (!isNaN(s.score_q4) ? parseInt(s.score_q4) : 0);
            empMap[key].total_score += (avg4 / 4);
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
        let declined_count = 0;
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
                        declined_at_step_1: false,
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
                } else if (evt.event_type === 'declined_at_step_1') {
                    sessionsMap[sid].declined_at_step_1 = true;
                }
                
                // Track the earliest timestamp
                if (new Date(evt.timestamp) < new Date(sessionsMap[sid].timestamp)) {
                    sessionsMap[sid].timestamp = evt.timestamp;
                }
            });

            const sessions = Object.values(sessionsMap);
            scanned_count = sessions.filter(s => s.scanned).length;
            survey_count = sessions.filter(s => s.survey_submitted).length;
            declined_count = sessions.filter(s => s.declined_at_step_1).length;

            sessions.forEach(s => {
                if (s.survey_submitted || s.declined_at_step_1) return;

                let status = '';
                let status_code = '';
                if (s.scanned) {
                    status = 'สแกนแล้ว (ยังไม่ส่งผล)';
                    status_code = 'scanned_only';
                } else {
                    return;
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
        }

        // Sort pending by date descending
        pending_customers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Recent Text Feedback (improvements_other)
        const textFeedbackList = filteredSurveys
            .filter(s => s.improvements_other && s.improvements_other.trim().length > 0)
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
            .slice(0, 10)
            .map(s => ({
                date: s.submitted_at,
                text: s.improvements_other
            }));

        // Recent 20 responses (overall view)
        const recent_responses = filteredSurveys
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
            .slice(0, 20)
            .map(s => {
                const avg4 = (!isNaN(s.score_q1) ? parseInt(s.score_q1) : 0) + 
                             (!isNaN(s.score_q2) ? parseInt(s.score_q2) : 0) + 
                             (!isNaN(s.score_q3) ? parseInt(s.score_q3) : 0) + 
                             (!isNaN(s.score_q4) ? parseInt(s.score_q4) : 0);
                return {
                    submitted_at: s.submitted_at,
                    employee_name: s.employee_name,
                    project_name: s.project_name,
                    customer_name: s.customer_name,
                    score: avg4 / 4,
                    suggestions: s.improvements_other
                };
            });

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
            question_stats: {
                q1: avg_q1,
                q2: avg_q2,
                q3: avg_q3,
                q4: avg_q4
            },
            improvement_bars: improvementBars,
            text_feedback: textFeedbackList,
            funnel: {
                scanned: scanned_count,
                survey_submitted: survey_count,
                declined: declined_count
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
