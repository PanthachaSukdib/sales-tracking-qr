// routes/qr-logs.js
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// POST /api/qr-logs: Record QR code generation event
router.post('/', (req, res, next) => {
    try {
        const { employee_id, employee_name, project_name, generated_url } = req.body;

        // Validation
        if (!employee_id || !employee_id.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุรหัสพนักงาน' });
        }
        if (!employee_name || !employee_name.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อ-นามสกุลพนักงาน' });
        }
        if (!generated_url || !generated_url.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุ URL ที่สร้างขึ้น' });
        }

        // Get Client IP and User Agent
        // Handles standard reverse proxies as well (like Cloudflare, Nginx, Railway)
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        const user_agent = req.headers['user-agent'] || null;

        // Insert into database synchronously using SQLite
        const stmt = db.prepare(`
            INSERT INTO qr_logs (employee_id, employee_name, project_name, generated_url, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id, created_at
        `);

        const row = stmt.get(
            employee_id.trim(),
            employee_name.trim(),
            project_name ? project_name.trim() : null,
            generated_url.trim(),
            ip_address,
            user_agent
        );

        const { id, created_at } = row;

        return res.status(201).json({ id, created_at });
    } catch (err) {
        console.error('Error saving QR Log:', err);
        return next(err);
    }
});

module.exports = router;
