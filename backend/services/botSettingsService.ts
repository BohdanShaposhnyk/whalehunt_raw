import db from '../db.js';

export interface BotSettings {
    botToken: string;
    chatId: string;
}

export function getBotSettings(cb: (settings: BotSettings) => void): void {
    db.get('SELECT * FROM bot_settings WHERE id = 1', (err: Error | null, row: any) => {
        if (err) {
            console.error('Error getting bot settings:', err);
            cb({ botToken: '', chatId: '' });
        } else if (!row) {
            cb({ botToken: '', chatId: '' });
        } else {
            cb({
                botToken: row.botToken || '',
                chatId: row.chatId || ''
            });
        }
    });
}

export function setBotSettings(settings: BotSettings, cb: (err: Error | null) => void): void {
    db.run(
        'INSERT OR REPLACE INTO bot_settings (id, botToken, chatId) VALUES (1, ?, ?)',
        [settings.botToken, settings.chatId],
        (err: Error | null) => {
            if (err) {
                console.error('Error saving bot settings:', err);
            }
            cb(err);
        }
    );
} 