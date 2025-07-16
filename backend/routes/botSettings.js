const express = require('express');
const router = express.Router();
const { getBotSettings, setBotSettings } = require('../services/botSettingsService');

router.get('/', (req, res) => {
    getBotSettings((settings) => res.json(settings));
});

router.post('/', (req, res) => {
    setBotSettings(req.body, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save bot settings' });
        getBotSettings((settings) => res.json(settings));
    });
});

module.exports = router; 