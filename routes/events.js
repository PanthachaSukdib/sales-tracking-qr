// routes/events.js — Event Tracking API
// บันทึกทุก step ของ Customer Journey ลง Google Sheets tab "events"

const express = require('express');
const router = express.Router();
const { insertRow } = require('../db/supabase-client');
const { randomUUID } = require('crypto');

/**
 * POST /api/events
 * Body: { session_id, event_type, employee_id, employee_name, customer_name, project_name, metadata }
 * 
 * event_type อาจเป็น:
 *   - "scanned"           → ลูกค้าสแกน QR Code สำเร็จ
 *   - "survey_submitted"  → ลูกค้าให้ดาวเสร็จแล้ว
 *   - "ms_forms_opened"   → ลูกค้ากดปุ่ม "ดำเนินการต่อ" ไป MS Forms
 *   - "skipped_ms_forms"  → ลูกค้ากด "ข้ามขั้นตอนนี้"
 */
router.post('/', async (req, res) => {
    const { session_id, event_type, employee_id, employee_name, customer_name, project_name, metadata } = req.body;

    // Basic Validation
    if (!session_id || !event_type) {
        return res.status(400).json({ error: 'Missing required fields: session_id, event_type' });
    }

    const VALID_EVENTS = ['scanned', 'survey_submitted', 'ms_forms_opened', 'skipped_ms_forms'];
    if (!VALID_EVENTS.includes(event_type)) {
        return res.status(400).json({ error: `Invalid event_type. Must be one of: ${VALID_EVENTS.join(', ')}` });
    }

    const id = randomUUID();
    const timestamp = new Date().toISOString();

    try {
        await insertRow('events', {
            id,
            timestamp,
            session_id,
            event_type,
            employee_id: employee_id || '',
            employee_name: employee_name || '',
            customer_name: customer_name || '',
            project_name: project_name || '',
            metadata: metadata || null
        });

        res.json({ id, timestamp, event_type, message: 'Event recorded' });
    } catch (err) {
        console.error('Event tracking failed:', err);
        res.status(500).json({ error: 'Failed to record event' });
    }
});

module.exports = router;
