import express, { Request, Response } from 'express';
import { getAlertSettings, setAlertSettings } from '../services/settingsService.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    getAlertSettings((settings: any) => res.json(settings));
});

router.post('/', (req: Request, res: Response) => {
    setAlertSettings(req.body, (err: any) => {
        if (err) return res.status(500).json({ error: 'Failed to save alert settings' });
        getAlertSettings((settings: any) => res.json(settings));
    });
});

export default router; 