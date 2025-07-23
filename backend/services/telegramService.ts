import axios from 'axios';

export interface TelegramMessage {
    botToken: string;
    chatId: string;
    message: string;
    parse_mode?: string;
}

export async function sendTelegramMessage({ botToken, chatId, message, parse_mode }: TelegramMessage): Promise<void> {
    if (!botToken || !chatId) throw new Error('Bot token or chat ID missing');
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: parse_mode || 'HTML',
        disable_web_page_preview: true
    });
} 