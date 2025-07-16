const axios = require('axios');

async function sendTelegramMessage({ botToken, chatId, message }) {
    if (!botToken || !chatId) throw new Error('Bot token or chat ID missing');
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    });
}

module.exports = { sendTelegramMessage }; 