const express = require('express');
const router = express.Router();
const { appendRow } = require('../db/sheets-client');
const { randomUUID } = require('crypto');

router.post('/', async (req, res) => {
    const { emp_id, emp_name, project, customer_name, satisfaction_score, suggestions } = req.body;

    // Validation
    if (!emp_id || !satisfaction_score) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const score = parseInt(satisfaction_score);
    if (isNaN(score) || score < 1 || score > 5) {
        return res.status(400).json({ error: 'Score must be 1-5' });
    }

    const id = randomUUID();
    const submitted_at = new Date().toISOString();

    try {
        await appendRow('survey_results', [
            id,
            submitted_at,
            emp_id,
            emp_name || '',
            project || '',
            customer_name || '',
            score,
            suggestions || ''
        ]);
        res.json({ id, submitted_at, message: 'ขอบคุณสำหรับความเห็น' });
    } catch (err) {
        console.error('Sheets append failed:', err);
        res.status(500).json({ error: 'Failed to save survey' });
    }
});

module.exports = router;
