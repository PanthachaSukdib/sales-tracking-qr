// routes/survey.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// POST /api/survey: Submit customer survey responses
router.post('/', (req, res, next) => {
    try {
        const { emp_id, emp_name, project, satisfaction_score, suggestions, qr_log_id } = req.body;

        // Validation
        if (!emp_id || !emp_id.trim()) {
            return res.status(400).json({ error: 'ไม่พบรหัสพนักงานผู้ให้บริการ' });
        }
        if (!emp_name || !emp_name.trim()) {
            return res.status(400).json({ error: 'ไม่พบชื่อพนักงานผู้ให้บริการ' });
        }

        const score = parseInt(satisfaction_score, 10);
        if (isNaN(score) || score < 1 || score > 5) {
            return res.status(400).json({ error: 'กรุณาเลือกคะแนนความพึงพอใจระหว่าง 1 ถึง 5 ดาว' });
        }

        // Get Client IP for the submitting customer
        const customer_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

        // Extract and clean optional variables
        const qrLogIdVal = qr_log_id ? parseInt(qr_log_id, 10) : null;
        const finalQrLogId = isNaN(qrLogIdVal) ? null : qrLogIdVal;

        // Insert into database synchronously using SQLite
        const stmt = db.prepare(`
            INSERT INTO survey_results (
                employee_id, employee_name, project_name, satisfaction_score, suggestions, qr_log_id, customer_ip
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id, submitted_at
        `);

        const row = stmt.get(
            emp_id.trim(),
            emp_name.trim(),
            project ? project.trim() : null,
            score,
            suggestions ? suggestions.trim() : null,
            finalQrLogId,
            customer_ip
        );

        const { id, submitted_at } = row;

        return res.status(201).json({
            id,
            submitted_at,
            message: 'ขอบคุณสำหรับความเห็นของคุณ ความเห็นของคุณได้รับบันทึกเรียบร้อยแล้ว'
        });
    } catch (err) {
        console.error('Error saving Survey Response:', err);
        return next(err);
    }
});

module.exports = router;
