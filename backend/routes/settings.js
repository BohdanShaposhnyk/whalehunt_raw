const express = require('express');
const router = express.Router();
const { getSettings, setSettings } = require('../services/settingsService');

router.get('/', (req, res) => {
    getSettings((settings) => res.json(settings));
});

router.post('/', (req, res) => {
    setSettings(req.body, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save settings' });
        getSettings((settings) => res.json(settings));
    });
});

module.exports = router; 