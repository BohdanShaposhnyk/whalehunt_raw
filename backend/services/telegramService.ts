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

    console.log('Sending Telegram message:');
    console.log('URL:', url);
    console.log('Chat ID:', chatId);
    console.log('Message length:', message.length);
    console.log('Parse mode:', parse_mode || 'HTML');
    console.log('Message preview:', message.substring(0, 100) + '...');

    try {
        const response = await axios.post(url, payload);
        console.log('Telegram API response:', response.status, response.statusText);
    } catch (error: any) {
        console.error('Telegram API error details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request Data:', error.config?.data);
        throw error;
    }
} 