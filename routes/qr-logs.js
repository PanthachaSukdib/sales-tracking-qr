const express = require('express');
const router = express.Router();
const { appendRow } = require('../db/sheets-client');
const { randomUUID } = require('crypto');

router.post('/', async (req, res) => {
    const { employee_id, employee_name, project_name, customer_name, generated_url } = req.body;
    
    // Validation
    if (!employee_id || !employee_name || !project_name || !customer_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = randomUUID();
    const created_at = new Date().toISOString();
    const user_agent = req.headers['user-agent'] || '';

    try {
        await appendRow('qr_logs', [
            id,
            created_at,
            employee_id,
            employee_name,
            project_name || '',
            customer_name || '',
            generated_url,
            user_agent
        ]);
        res.json({ id, created_at });
    } catch (err) {
        console.error('Sheets append failed:', err);
        res.status(500).json({ error: 'Failed to log QR generation' });
    }
});

module.exports = router;
