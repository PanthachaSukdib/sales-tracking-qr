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

module.exports = db;
