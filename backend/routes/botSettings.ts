import express, { Request, Response } from 'express';
import { getBotSettings, setBotSettings, BotSettings } from '../services/botSettingsService.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    getBotSettings((settings: BotSettings) => res.json(settings));
});

router.post('/', (req: Request, res: Response) => {
    setBotSettings(req.body, (err: any) => {
        if (err) return res.status(500).json({ error: 'Failed to save bot settings' });
        getBotSettings((settings: BotSettings) => res.json(settings));
    });
});

export default router; 