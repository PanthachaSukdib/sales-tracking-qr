// db/connection.js
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Resolve database path (default to ./data/database.db)
const dbPath = process.env.DATABASE_PATH || './data/database.db';
const dbDir = path.dirname(path.resolve(dbPath));

// Ensure the parent directory exists
if (!fs.existsSync(dbDir)) {
    console.log(`📁 Directory '${dbDir}' not found, creating it...`);
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`🔋 Initializing SQLite database at: ${dbPath}`);

// Initialize the database synchronously
const db = new DatabaseSync(dbPath);

// Enable Foreign Key constraints and Write-Ahead Logging (WAL) for concurrency & speed
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Robust Automatic Schema Bootstrapping
// If tables are missing (e.g., fresh persistent volume on Railway), build them instantly!
try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='qr_logs'").get();
    if (!tableCheck) {
        console.log('⚡ Database is empty. Bootstrapping tables and indexes from schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schemaSql);
            console.log('✅ Database schema bootstrapped successfully!');
        } else {
            console.log('⚠️ Could not find schema.sql to initialize database.');
        }
    }
} catch (err) {
    console.error('⚠️ Failed to verify/bootstrap database schema:', err.message);
}

module.exports = db;
