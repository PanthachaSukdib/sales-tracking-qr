const express = require('express');
const router = express.Router();
const { appendRow, getAllRowsAsObjects } = require('../db/sheets-client');
const { randomUUID } = require('crypto');

// ตรวจสอบการส่งแบบประเมินซ้ำ (GET /api/survey/check-completed)
router.get('/check-completed', async (req, res) => {
    const { emp_id, customer, project } = req.query;

    if (!emp_id || !customer || !project) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
        const [surveys, events] = await Promise.all([
            getAllRowsAsObjects('survey_results').catch(err => {
                console.warn('Failed to fetch survey results for duplicate check, skipping:', err);
                return [];
            }),
            getAllRowsAsObjects('events').catch(err => {
                console.warn('Failed to fetch events for duplicate check, skipping:', err);
                return [];
            })
        ]);

        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. ตรวจสอบว่าโครงการ/เลข Job นี้เคยประเมินให้ดาวไปแล้วหรือไม่
        const alreadyCompleted = surveys.some(s => s.project_name === project);

        // 2. ตรวจสอบว่าเคยดำเนินการทำแบบฟอร์มขั้นตอนสุดท้าย (คลิกไปต่อ หรือกดข้าม) ไปแล้วหรือยังใน 24 ชม.
        const finalStepDone = events.some(evt => {
            const isMatch = evt.project_name === project;
            if (!isMatch) return false;

            const isFinalEvent = evt.event_type === 'ms_forms_opened' || evt.event_type === 'skipped_ms_forms';
            if (!isFinalEvent) return false;

            const eventTime = new Date(evt.timestamp).getTime();
            if (isNaN(eventTime)) return false;

            return (now - eventTime) < ONE_DAY_MS;
        });

        res.json({ 
            completed: alreadyCompleted,
            final_step_done: finalStepDone
        });
    } catch (err) {
        console.error('Check completed failed:', err);
        res.status(500).json({ error: 'Failed to check completion status' });
    }
});

router.post('/', async (req, res) => {
    const { session_id, emp_id, emp_name, project, customer_name, satisfaction_score, suggestions } = req.body;

    // Validation
    if (!emp_id || !satisfaction_score) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const score = parseInt(satisfaction_score);
    if (isNaN(score) || score < 1 || score > 5) {
        return res.status(400).json({ error: 'Score must be 1-5' });
    }

    try {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. ป้องกันการบันทึกซ้ำ (Idempotency) ที่ฝั่ง Server โดยตรวจเช็คจาก session_id ในตาราง events
        if (session_id) {
            const events = await getAllRowsAsObjects('events').catch(err => {
                console.warn('Failed to fetch events for duplicate check, skipping:', err);
                return [];
            });
            const alreadySubmitted = events.some(evt => evt.session_id === session_id && evt.event_type === 'survey_submitted');
            if (alreadySubmitted) {
                console.log(`[Duplicate survey block] session_id: ${session_id} has already submitted score.`);
                return res.json({ id: session_id, message: 'คุณได้ส่งความคิดเห็นนี้เรียบร้อยแล้ว' });
            }
        }

        // 2. ป้องกันการบันทึกซ้ำแบบข้าม Session — ใช้ชื่อโครงการ (เลข Job งาน) ในการตรวจสอบระบบ
        const surveys = await getAllRowsAsObjects('survey_results').catch(err => {
            console.warn('Failed to fetch survey results for backend cross-session duplicate check:', err);
            return [];
        });

        const alreadySubmitted = surveys.some(s => s.project_name === project);

        if (alreadySubmitted) {
            console.log(`[Duplicate survey block] project (Job Number): ${project} has already submitted score.`);
            return res.json({ id: 'duplicate', message: 'คุณได้ส่งความคิดเห็นนี้เรียบร้อยแล้ว' });
        }

        const id = randomUUID();
        const submitted_at = new Date().toISOString();

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
