const db = require('../db');

function getAlertSettings(cb) {
    db.get('SELECT * FROM alert_settings WHERE id = 1', (err, row) => {
        if (err || !row) {
            cb({ greenRed: 10000, blueYellow: 5000, pollingInterval: 30, enabled: false });
        } else {
            cb({
                greenRed: row.greenRed,
                blueYellow: row.blueYellow,
                pollingInterval: row.pollingInterval,
                enabled: !!row.enabled
            });
        }
    });
}

function setAlertSettings(settings, cb) {
    db.run(
        'UPDATE alert_settings SET greenRed = ?, blueYellow = ?, pollingInterval = ?, enabled = ? WHERE id = 1',
        [settings.greenRed, settings.blueYellow, settings.pollingInterval, settings.enabled ? 1 : 0],
        cb
    );
}

module.exports = { getAlertSettings, setAlertSettings }; 