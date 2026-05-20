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
// Cache fonts for 1 year
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts'), {
    maxAge: '1y',
    immutable: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
const qrLogsRouter = require('./routes/qr-logs');
const surveyRouter = require('./routes/survey');
const reportsRouter = require('./routes/reports');

app.use('/api/qr-logs', qrLogsRouter);
app.use('/api/survey', surveyRouter);
app.use('/api/reports', reportsRouter);

// Config Endpoints
app.get('/api/config/ms-forms-url', (req, res) => {
    res.json({ url: process.env.MS_FORMS_URL || '' });
});

app.get('/api/config/qr-base', (req, res) => {
    res.json({ baseUrl: process.env.QR_REDIRECT_BASE_URL || '/scan.html' });
});

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sales Tracking Server is running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}/`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
