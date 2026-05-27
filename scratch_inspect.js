const dotenv = require('dotenv');
dotenv.config();

const { getAllRowsAsObjects } = require('./db/sheets-client');

async function run() {
    try {
        const results = await getAllRowsAsObjects('events');
        console.log('--- EVENTS ---');
        results.slice(-20).forEach(r => {
            console.log(`ID: ${r.id} | Time: ${r.timestamp} | Session: ${r.session_id} | Event: ${r.event_type} | Customer: ${r.customer_name}`);
        });
    } catch (err) {
        console.error(err);
    }
}
run();
