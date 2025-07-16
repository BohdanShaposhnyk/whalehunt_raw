const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getSettings, setSettings } = require('../services/settingsService');

function isAuthorized(chatId, settings) {
    if (settings.chatId && settings.chatId !== chatId.toString()) {
        return false;
    }
    return true;
}

async function sendTelegramMessage(botToken, chatId, text) {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text,
    });
}

router.post('/', (req, res) => {
    const update = req.body;
    getSettings(async (settings) => {
        if (!settings.botToken) return res.sendStatus(200);
        if (!update.message || !update.message.text) return res.sendStatus(200);
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        if (!isAuthorized(chatId, settings)) return res.sendStatus(200);

        // Command handling
        if (text === '/status') {
            await sendTelegramMessage(settings.botToken, chatId, `Current settings:\n${JSON.stringify(settings, null, 2)}`);
        } else if (/^\/set_threshold (\d+)/.test(text)) {
            const value = parseInt(text.split(' ')[1], 10);
            setSettings({ ...settings, greenRed: value }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Whale threshold set to ${value}`);
            });
        } else if (/^\/set_dolphin (\d+)/.test(text)) {
            const value = parseInt(text.split(' ')[1], 10);
            setSettings({ ...settings, blueYellow: value }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Dolphin threshold set to ${value}`);
            });
        } else if (/^\/set_interval (\d+)/.test(text)) {
            const value = parseInt(text.split(' ')[1], 10);
            setSettings({ ...settings, pollingInterval: value }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Polling interval set to ${value} seconds`);
            });
        } else if (/^\/set_token (.+)/.test(text)) {
            const value = text.split(' ').slice(1).join(' ').trim();
            setSettings({ ...settings, botToken: value }, () => {
                sendTelegramMessage(value, chatId, `Bot token updated.`);
            });
        } else if (/^\/set_chatid (.+)/.test(text)) {
            const value = text.split(' ').slice(1).join(' ').trim();
            setSettings({ ...settings, chatId: value }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Chat ID updated.`);
            });
        } else if (text === '/enable') {
            setSettings({ ...settings, enabled: true }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Notifications enabled.`);
            });
        } else if (text === '/disable') {
            setSettings({ ...settings, enabled: false }, () => {
                sendTelegramMessage(settings.botToken, chatId, `Notifications disabled.`);
            });
        } else if (text === '/help') {
            sendTelegramMessage(settings.botToken, chatId, `Available commands:\n/status\n/set_threshold <number>\n/set_dolphin <number>\n/set_interval <number>\n/set_token <token>\n/set_chatid <id>\n/enable\n/disable`);
        }
        res.sendStatus(200);
    });
});

module.exports = router; 