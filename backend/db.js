const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    botToken TEXT,
    chatId TEXT,
    enabled INTEGER DEFAULT 0,
    greenRed INTEGER DEFAULT 10000,
    blueYellow INTEGER DEFAULT 5000,
    pollingInterval INTEGER DEFAULT 30
  )`);
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
        if (!row) {
            db.run('INSERT INTO settings (id, botToken, chatId, enabled, greenRed, blueYellow, pollingInterval) VALUES (1, "", "", 0, 10000, 5000, 30)');
        }
    });
});

module.exports = db; 