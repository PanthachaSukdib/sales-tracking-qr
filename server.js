// server.js
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
const qrLogsRouter = require('./routes/qr-logs');
const surveyRouter = require('./routes/survey');
const reportsRouter = require('./routes/reports');

app.use('/api/qr-logs', qrLogsRouter);
app.use('/api/survey', surveyRouter);
app.use('/api/reports', reportsRouter);

// Fallback for non-existent public files or APIs
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), {}, (err) => {
            if (err) {
                res.status(404).send('<h1>404 - ไม่พบหน้าเว็บที่คุณต้องการ</h1>');
            }
        });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled System Error:', err);
    res.status(500).json({ 
        error: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้งในภายหลัง' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sales Tracking Server is running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}/`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
