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
        const [qrLogs, surveys] = await Promise.all([
            getAllRowsAsObjects('qr_logs'),
            getAllRowsAsObjects('survey_results')
        ]);

        // Filter by date range if provided
        const filterByDate = (rows, dateField) => {
            if (!from && !to) return rows;
            return rows.filter(r => {
                const d = new Date(r[dateField]);
                if (from && d < new Date(from)) return false;
                if (to && d > new Date(to + 'T23:59:59')) return false;
                return true;
            });
        };

        const filteredQR = filterByDate(qrLogs, 'created_at');
        const filteredSurveys = filterByDate(surveys, 'submitted_at');

        // Totals
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

        // Recent 20
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

        res.json({
            totals: { qr_generated, surveys_received, response_rate, avg_score },
            by_employee,
            recent_responses
        });
    } catch (err) {
        console.error('Reports failed:', err);
        res.status(500).json({ error: 'Failed to load reports' });
    }
});

module.exports = router;
