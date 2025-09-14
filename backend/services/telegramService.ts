import axios from 'axios';

export interface TelegramMessage {
    botToken: string;
    chatId: string;
    message: string;
    parse_mode?: string;
}

export async function sendTelegramMessage({ botToken, chatId, message, parse_mode }: TelegramMessage): Promise<void> {
    if (!botToken || !chatId) throw new Error('Bot token or chat ID missing');

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: parse_mode || 'HTML',
        disable_web_page_preview: true
    };

    try {
        await axios.post(url, payload);
        console.log('Telegram message sent successfully');
    } catch (error: any) {
        console.error('Telegram API error:', error.response?.data?.description || error.message);
        throw error;
    }
}