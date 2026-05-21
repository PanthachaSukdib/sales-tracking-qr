const express = require('express');
const router = express.Router();
const { appendRow, getAllRowsAsObjects } = require('../db/sheets-client');
const { randomUUID } = require('crypto');

router.post('/', async (req, res) => {
    const { employee_id, employee_name, project_name, customer_name, generated_url } = req.body;
    
    // Validation
    if (!employee_id || !employee_name || !project_name || !customer_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // ตรวจสอบว่า project_name (เลข Job งาน) นี้เคยสร้าง QR ไปแล้วหรือยัง
        if (project_name) {
            const existingRows = await getAllRowsAsObjects('qr_logs').catch(err => {
                console.warn('Failed to fetch qr_logs for duplicate check, skipping:', err);
                return [];
            });

            const existing = existingRows.find(row =>
                row.project_name === project_name
            );

            if (existing) {
                console.log(`[Duplicate QR block] project_name (Job Number): ${project_name} already exists in qr_logs.`);
                return res.json({
                    already_exists: true,
                    id: existing.id,
                    created_at: existing.created_at,
                    employee_id: existing.employee_id,
                    employee_name: existing.employee_name,
                    project_name: existing.project_name,
                    customer_name: existing.customer_name,
                    generated_url: existing.generated_url
                });
            }
        }

        const id = randomUUID();
        const created_at = new Date().toISOString();
        const user_agent = req.headers['user-agent'] || '';

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
