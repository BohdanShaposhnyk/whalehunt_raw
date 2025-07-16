const express = require('express');
const router = express.Router();
const { getAlertSettings, setAlertSettings } = require('../services/settingsService');

router.get('/', (req, res) => {
    getAlertSettings((settings) => res.json(settings));
});

router.post('/', (req, res) => {
    setAlertSettings(req.body, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save alert settings' });
        getAlertSettings((settings) => res.json(settings));
    });
});

module.exports = router; 