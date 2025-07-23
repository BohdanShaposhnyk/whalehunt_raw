import db from '../db.js';

export interface BotSettings {
    botToken: string;
    chatId: string;
}

export function getBotSettings(cb: (settings: BotSettings) => void): void {
    db.get('SELECT * FROM bot_settings WHERE id = 1', (err: Error | null, row: any) => {
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

export function setBotSettings(settings: BotSettings, cb: (err: Error | null) => void): void {
    db.run(
        'UPDATE bot_settings SET botToken = ?, chatId = ? WHERE id = 1',
        [settings.botToken, settings.chatId],
        cb
    );
} 