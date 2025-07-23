import express, { Request, Response } from 'express';
import { getBotSettings, BotSettings } from '../services/botSettingsService.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { formatSwapMessage } from '../utils/formatMessage.js';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
    getBotSettings(async (settings: BotSettings) => {
        try {
            // Always pending test swap
            const isApe = Math.random() < 0.5;
            const inAmount = (Math.random() * 1000 + 100).toFixed(4);
            const outAmount = (Math.random() * 1000 + 100).toFixed(4);
            const inAsset = isApe ? 'GAIA.ATOM' : 'RUNE.RUJI';
            const outAsset = isApe ? 'RUNE.RUJI' : 'GAIA.ATOM';
            const inValue = (parseFloat(inAmount) * (Math.random() * 10 + 1));
            const outValue = (parseFloat(outAmount) * (Math.random() * 10 + 1));
            const maxValue = Math.max(inValue, outValue);
            const status = 'pending';
            const input = {
                address: 'testaddress',
                txID: 'testtxid',
            };
            const msg = formatSwapMessage({ inAmount: parseFloat(inAmount), inAsset, inValue, outAmount: parseFloat(outAmount), outAsset, outValue, maxValue, status, input });
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

export default router; 