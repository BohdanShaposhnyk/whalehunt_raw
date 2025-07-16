const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

db.serialize(() => {
    // Create bot_settings table
    db.run(`CREATE TABLE IF NOT EXISTS bot_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        botToken TEXT,
        chatId TEXT
    )`);
    db.get('SELECT * FROM bot_settings WHERE id = 1', (err, row) => {
        if (!row) {
            db.run('INSERT INTO bot_settings (id, botToken, chatId) VALUES (1, "", "")');
        }
    });

    // Create alert_settings table
    db.run(`CREATE TABLE IF NOT EXISTS alert_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        greenRed INTEGER DEFAULT 10000,
        blueYellow INTEGER DEFAULT 5000,
        pollingInterval INTEGER DEFAULT 30,
        enabled INTEGER DEFAULT 0
    )`);
    db.get('SELECT * FROM alert_settings WHERE id = 1', (err, row) => {
        if (!row) {
            db.run('INSERT INTO alert_settings (id, greenRed, blueYellow, pollingInterval, enabled) VALUES (1, 10000, 5000, 30, 0)');
        }
    });

    // Migrate data from old settings table if present
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
        if (row) {
            db.run('UPDATE bot_settings SET botToken = ?, chatId = ? WHERE id = 1', [row.botToken, row.chatId]);
            db.run('UPDATE alert_settings SET greenRed = ?, blueYellow = ?, pollingInterval = ?, enabled = ? WHERE id = 1', [row.greenRed, row.blueYellow, row.pollingInterval, row.enabled]);
            db.run('DROP TABLE settings');
        }
    });
});

module.exports = db; 