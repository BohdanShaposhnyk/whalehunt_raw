import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a more reliable database path for Railway deployment
const dbPath = process.env.NODE_ENV === 'production'
    ? '/tmp/db.sqlite'  // Railway's writable directory
    : path.join(__dirname, 'db.sqlite');

console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

db.serialize(() => {
    console.log('Initializing database tables...');

    // Create bot_settings table
    db.run(`CREATE TABLE IF NOT EXISTS bot_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        botToken TEXT,
        chatId TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating bot_settings table:', err);
        } else {
            console.log('bot_settings table ready');
        }
    });

    db.get('SELECT * FROM bot_settings WHERE id = 1', (err: Error | null, row: any) => {
        if (err) {
            console.error('Error checking bot_settings:', err);
        } else if (!row) {
            console.log('Creating default bot_settings record');
            db.run('INSERT INTO bot_settings (id, botToken, chatId) VALUES (1, "", "")', (err) => {
                if (err) {
                    console.error('Error creating default bot_settings:', err);
                } else {
                    console.log('Default bot_settings created');
                }
            });
        } else {
            console.log('bot_settings record exists');
        }
    });

    // Create alert_settings table
    db.run(`CREATE TABLE IF NOT EXISTS alert_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        greenRed INTEGER DEFAULT 10000,
        blueYellow INTEGER DEFAULT 5000,
        pollingInterval INTEGER DEFAULT 30,
        enabled INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating alert_settings table:', err);
        } else {
            console.log('alert_settings table ready');
        }
    });

    db.get('SELECT * FROM alert_settings WHERE id = 1', (err: Error | null, row: any) => {
        if (err) {
            console.error('Error checking alert_settings:', err);
        } else if (!row) {
            console.log('Creating default alert_settings record');
            db.run('INSERT INTO alert_settings (id, greenRed, blueYellow, pollingInterval, enabled) VALUES (1, 10000, 5000, 30, 0)', (err) => {
                if (err) {
                    console.error('Error creating default alert_settings:', err);
                } else {
                    console.log('Default alert_settings created');
                }
            });
        } else {
            console.log('alert_settings record exists');
        }
    });

    // Migrate data from old settings table if present
    db.get('SELECT * FROM settings WHERE id = 1', (err: Error | null, row: any) => {
        if (err) {
            console.log('No old settings table found (this is normal)');
        } else if (row) {
            console.log('Migrating data from old settings table');
            db.run('UPDATE bot_settings SET botToken = ?, chatId = ? WHERE id = 1', [row.botToken, row.chatId]);
            db.run('UPDATE alert_settings SET greenRed = ?, blueYellow = ?, pollingInterval = ?, enabled = ? WHERE id = 1', [row.greenRed, row.blueYellow, row.pollingInterval, row.enabled]);
            db.run('DROP TABLE settings');
        }
    });
});

export default db; 