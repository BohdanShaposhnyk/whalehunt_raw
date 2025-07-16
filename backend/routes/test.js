const express = require('express');
const router = express.Router();
const { getSettings } = require('../services/settingsService');
const { sendTelegramMessage } = require('../services/telegramService');
const { formatSwapMessage } = require('../utils/formatMessage');

router.post('/', (req, res) => {
    getSettings(async (settings) => {
        try {
            // Always pending test swap
            const isApe = Math.random() < 0.5;
            const inAmount = (Math.random() * 1000 + 100).toFixed(4);
            const outAmount = (Math.random() * 1000 + 100).toFixed(4);
            const inAsset = isApe ? 'GAIA.ATOM' : 'RUNE.RUJI';
            const outAsset = isApe ? 'RUNE.RUJI' : 'GAIA.ATOM';
            const inValue = (inAmount * (Math.random() * 10 + 1)).toFixed(2);
            const outValue = (outAmount * (Math.random() * 10 + 1)).toFixed(2);
            const maxValue = Math.max(inValue, outValue).toFixed(2);
            // Randomize height and swapTarget for duration
            const height = (Math.floor(Math.random() * 100000) + 100000).toString();
            const durationBlocks = Math.floor(Math.random() * 1000) + 10; // 10-1009 blocks
            const swapTarget = (parseInt(height) + durationBlocks).toString();
            const metadata = { swap: { swapTarget } };
            const status = 'pending';
            const msg = formatSwapMessage({ inAmount, inAsset, inValue, outAmount, outAsset, outValue, maxValue, status, height, metadata });
            await sendTelegramMessage({
                botToken: settings.botToken,
                chatId: settings.chatId,
                message: msg,
                parse_mode: 'HTML',
            });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Failed to send test notification' });
        }
    });
});

module.exports = router; 