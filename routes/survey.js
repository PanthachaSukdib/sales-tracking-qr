const express = require('express');
const router = express.Router();
const { supabase, insertRow } = require('../db/supabase-client');
const { randomUUID } = require('crypto');

// ตรวจสอบการส่งแบบประเมินซ้ำ (GET /api/survey/check-completed)
router.get('/check-completed', async (req, res) => {
    const { emp_id, customer, project } = req.query;

    if (!emp_id || !customer || !project) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const oneDayAgo = new Date(Date.now() - ONE_DAY_MS).toISOString();

        const [surveyResponse, eventResponse] = await Promise.all([
            supabase
                .from('survey_results')
                .select('id')
                .eq('project_name', project)
                .limit(1),
            supabase
                .from('events')
                .select('id')
                .eq('project_name', project)
                .in('event_type', ['survey_submitted', 'declined_at_step_1'])
                .gte('timestamp', oneDayAgo)
                .limit(1)
        ]);

        const alreadyCompleted = surveyResponse.data && surveyResponse.data.length > 0;
        const finalStepDone = eventResponse.data && eventResponse.data.length > 0;

        res.json({ 
            completed: !!alreadyCompleted,
            final_step_done: !!finalStepDone
        });
    } catch (err) {
        console.error('Check completed failed:', err);
        res.status(500).json({ error: 'Failed to check completion status' });
    }
});

router.post('/', async (req, res) => {
    const {
        session_id,
        employee_id,
        employee_name,
        project_name,
        customer_name,
        pdpa_consent_1,
        score_q1,
        score_q2,
        score_q3,
        score_q4,
        improvements,
        improvements_other,
        contact_name,
        contact_phone,
        contact_email,
        pdpa_consent_2
    } = req.body;

    // Validation
    if (!employee_id || !score_q1 || !score_q2 || !score_q3 || !score_q4 || !pdpa_consent_1) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. ป้องกันการบันทึกซ้ำ (Idempotency) ที่ฝั่ง Server โดยตรวจเช็คจาก session_id ในตาราง events
        if (session_id) {
            const { data: events, error } = await supabase
                .from('events')
                .select('id')
                .eq('session_id', session_id)
                .eq('event_type', 'survey_submitted')
                .limit(1);

            if (error) {
                console.warn('Failed to fetch events for duplicate check, skipping:', error);
            } else if (events && events.length > 0) {
                console.log(`[Duplicate survey block] session_id: ${session_id} has already submitted score.`);
                return res.json({ id: session_id, message: 'คุณได้ส่งความคิดเห็นนี้เรียบร้อยแล้ว' });
            }
        }

        // 2. ป้องกันการบันทึกซ้ำแบบข้าม Session — ใช้ชื่อโครงการ (เลข Job งาน) ในการตรวจสอบระบบ
        if (project_name) {
            const { data: surveys, error: surveyError } = await supabase
                .from('survey_results')
                .select('id')
                .eq('project_name', project_name)
                .limit(1);

            if (surveyError) {
                console.warn('Failed to fetch survey results for backend cross-session duplicate check:', surveyError);
            } else if (surveys && surveys.length > 0) {
                console.log(`[Duplicate survey block] project (Job Number): ${project_name} has already submitted score.`);
                return res.json({ id: 'duplicate', message: 'คุณได้ส่งความคิดเห็นนี้เรียบร้อยแล้ว' });
            }
        }

        const id = randomUUID();
        const submitted_at = new Date().toISOString();

        await insertRow('survey_results', {
            id,
            submitted_at,
            session_id: session_id || '',
            employee_id: employee_id || '',
            employee_name: employee_name || '',
            project_name: project_name || '',
            customer_name: customer_name || '',
            pdpa_consent_1: pdpa_consent_1 || '',
            score_q1,
            score_q2,
            score_q3,
            score_q4,
            improvements: improvements || '',
            improvements_other: improvements_other || '',
            contact_name: contact_name || '',
            contact_phone: contact_phone || '',
            contact_email: contact_email || '',
            pdpa_consent_2: pdpa_consent_2 || ''
        });
        res.json({ id, submitted_at, message: 'ขอบคุณสำหรับความเห็น' });
    } catch (err) {
        console.error('Sheets append failed:', err);
        res.status(500).json({ error: 'Failed to save survey' });
    }
});

module.exports = router;
