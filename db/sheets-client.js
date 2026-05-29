const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!SHEET_ID) throw new Error('GOOGLE_SHEET_ID is required in .env');

let authOpts = {
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
};

if (process.env.GOOGLE_CREDENTIALS) {
    // Railway Deployment: Read from Environment Variable
    authOpts.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
    // Local Development: Read from JSON file
    const KEY_PATH = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    if (!fs.existsSync(KEY_PATH)) {
        throw new Error('Service account file not found at ' + KEY_PATH);
    }
    authOpts.keyFile = KEY_PATH;
}

const auth = new google.auth.GoogleAuth(authOpts);

let _sheetsClient = null;
async function getSheets() {
    if (!_sheetsClient) {
        const authClient = await auth.getClient();
        _sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    }
    return _sheetsClient;
}

// Append a row to the given tab
async function appendRow(tabName, values) {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${tabName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [values] }
    });
    return res.data;
}

// Read all rows from a tab (excluding header)
async function getAllRows(tabName) {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tabName}!A2:Z`
    });
    return res.data.values || [];
}

// Get rows with header info, returned as objects
async function getAllRowsAsObjects(tabName) {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${tabName}!A1:Z`
    });
    const rows = res.data.values || [];
    if (rows.length < 2) return [];
    
    // Trim headers to prevent issues with trailing spaces in Google Sheets
    const headers = rows[0].map(h => (h || '').trim());
    
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] || null; });
        return obj;
    });
}

module.exports = { appendRow, getAllRows, getAllRowsAsObjects };
