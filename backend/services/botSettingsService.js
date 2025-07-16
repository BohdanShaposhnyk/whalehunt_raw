const db = require('../db');

function getBotSettings(cb) {
    db.get('SELECT * FROM bot_settings WHERE id = 1', (err, row) => {
        if (err || !row) {
            cb({ botToken: '', chatId: '' });
        } else {
            cb({
                botToken: row.botToken || '',
                chatId: row.chatId || ''
            });
        }
    });
}

function setBotSettings(settings, cb) {
    db.run(
        'UPDATE bot_settings SET botToken = ?, chatId = ? WHERE id = 1',
        [settings.botToken, settings.chatId],
        cb
    );
}

module.exports = { getBotSettings, setBotSettings }; 