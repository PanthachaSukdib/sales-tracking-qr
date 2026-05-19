// routes/reports.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Summary Reports"');
        return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบเพื่อดูรายงาน' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Summary Reports"');
        return res.status(401).json({ error: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง' });
    }

    const auth = Buffer.from(token, 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    const expectedUser = process.env.DASHBOARD_USER || 'admin';
    const expectedPass = process.env.DASHBOARD_PASS || 'changeme';

    if (username === expectedUser && password === expectedPass) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Summary Reports"');
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
};

// Helper: Format JS Date into standard SQLite string format (YYYY-MM-DD HH:MM:SS) using local parts
function formatSqliteDateTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// GET /api/reports/summary: Fetch metrics and lists with Basic Auth protection
router.get('/summary', basicAuth, (req, res, next) => {
    try {
        // Parse filter dates (default to 30 days if not provided)
        let startDate = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        let endDate = req.query.to ? new Date(req.query.to) : new Date();

        // Standardize dates to start of day and end of day in local time
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Format dates into SQLite query strings
        const startStr = formatSqliteDateTime(startDate);
        const endStr = formatSqliteDateTime(endDate);

        // 1. Count QR logs created in date range
        const qrCountRow = db.prepare(
            'SELECT COUNT(*) AS count FROM qr_logs WHERE created_at >= ? AND created_at <= ?'
        ).get(startStr, endStr);
        const qr_generated = qrCountRow.count || 0;

        // 2. Aggregate overall survey responses (count and average score)
        const surveyAggRow = db.prepare(
            'SELECT COUNT(*) AS count, AVG(satisfaction_score) AS avg_score FROM survey_results WHERE submitted_at >= ? AND submitted_at <= ?'
        ).get(startStr, endStr);
        const surveys_received = surveyAggRow.count || 0;
        const rawAvg = surveyAggRow.avg_score !== null ? surveyAggRow.avg_score : 0.0;
        const avg_score = parseFloat(rawAvg.toFixed(1));

        // 3. Aggregate data per employee
        const employeeRows = db.prepare(`
            SELECT 
                employee_id, 
                employee_name, 
                COUNT(*) AS responses, 
                ROUND(AVG(satisfaction_score), 1) AS avg_score
            FROM survey_results 
            WHERE submitted_at >= ? AND submitted_at <= ?
            GROUP BY employee_id, employee_name
            ORDER BY avg_score DESC, responses DESC
        `).all(startStr, endStr);

        // 4. Retrieve recent 20 submissions
        const recentRows = db.prepare(`
            SELECT 
                submitted_at, 
                employee_name, 
                project_name, 
                customer_name,
                satisfaction_score AS score, 
                suggestions
            FROM survey_results
            WHERE submitted_at >= ? AND submitted_at <= ?
            ORDER BY submitted_at DESC
            LIMIT 20
        `).all(startStr, endStr);

        // Response rate percentage rounded to 1 decimal place
        const response_rate = qr_generated > 0 
            ? parseFloat(((surveys_received / qr_generated) * 100).toFixed(1)) 
            : 0.0;

        const totals = {
            qr_generated,
            surveys_received,
            response_rate,
            avg_score
        };

        return res.json({
            totals,
            by_employee: employeeRows,
            recent_responses: recentRows
        });
    } catch (err) {
        console.error('Error generating summary report:', err);
        return next(err);
    }
});

module.exports = router;
