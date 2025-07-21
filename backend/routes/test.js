const express = require('express');
const router = express.Router();
const { getBotSettings } = require('../services/botSettingsService');
const { sendTelegramMessage } = require('../services/telegramService');
const { formatSwapMessage } = require('../utils/formatMessage');

router.post('/', (req, res) => {
    getBotSettings(async (settings) => {
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
            // Build a memo for streaming swap duration
            const interval = Math.floor(Math.random() * 20) + 1; // 1-20 blocks
            const numSwaps = Math.floor(Math.random() * 200) + 10; // 10-209 partial swaps
            const memo = `=:b:someaddress:0/${interval}/${numSwaps}:ro/ds:0`;
            const durationSec = interval * numSwaps * 6;
            const status = 'pending';
            const input = {
                address: 'testaddress',
                txID: 'testtxid',
            };
            const msg = formatSwapMessage({ inAmount, inAsset, inValue, outAmount, outAsset, outValue, maxValue, status, durationSec, input });
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