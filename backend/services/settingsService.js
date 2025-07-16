const db = require('../db');

function getSettings(cb) {
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
        if (err || !row) {
            cb({ botToken: '', chatId: '', enabled: false, greenRed: 10000, blueYellow: 5000, pollingInterval: 30 });
        } else {
            cb({
                botToken: row.botToken || '',
                chatId: row.chatId || '',
                enabled: !!row.enabled,
                greenRed: row.greenRed,
                blueYellow: row.blueYellow,
                pollingInterval: row.pollingInterval
            });
        }
    });
}

function setSettings(settings, cb) {
    db.run(
        'UPDATE settings SET botToken = ?, chatId = ?, enabled = ?, greenRed = ?, blueYellow = ?, pollingInterval = ? WHERE id = 1',
        [settings.botToken, settings.chatId, settings.enabled ? 1 : 0, settings.greenRed, settings.blueYellow, settings.pollingInterval],
        cb
    );
}

module.exports = { getSettings, setSettings }; 