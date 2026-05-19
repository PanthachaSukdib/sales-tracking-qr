// scripts/init-db.js
const fs = require('fs');
const path = require('path');
const db = require('../db/connection');

function initializeDatabase() {
    console.log('⚡ Starting SQLite Database Initialization...');
    
    try {
        // 1. Read schema.sql
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`schema.sql not found at ${schemaPath}`);
        }
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('⏳ Running schema.sql...');
        db.exec(schemaSql);
        console.log('✓ Created table qr_logs and survey_results');

        // 2. Read seed.sql
        const seedPath = path.join(__dirname, '../db/seed.sql');
        if (fs.existsSync(seedPath)) {
            console.log('⏳ Seeding database with mock data...');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            db.exec(seedSql);
            console.log('✓ Mock records seeded successfully.');
        } else {
            console.log('ℹ️ No seed.sql file found, skipping seeding.');
        }

        console.log('\n🎉 SQLite database initialization finished successfully!');
    } catch (err) {
        console.error('\n❌ SQLite Database Initialization Failed!');
        console.error('-------------------------------------------');
        console.error('Error Details:', err.message);
        console.error('-------------------------------------------');
        process.exit(1);
    } finally {
        // Close database handle
        db.close();
        console.log('👋 Database connection closed.');
    }
}

initializeDatabase();
