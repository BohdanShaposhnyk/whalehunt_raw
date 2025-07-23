import db from '../db.js';

export interface AlertSettings {
    greenRed: number;
    blueYellow: number;
    pollingInterval: number;
    enabled: boolean;
}

export function getAlertSettings(cb: (settings: AlertSettings) => void): void {
    db.get('SELECT * FROM alert_settings WHERE id = 1', (err: Error | null, row: any) => {
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

export function setAlertSettings(settings: AlertSettings, cb: (err: Error | null) => void): void {
    db.run(
        'UPDATE alert_settings SET greenRed = ?, blueYellow = ?, pollingInterval = ?, enabled = ? WHERE id = 1',
        [settings.greenRed, settings.blueYellow, settings.pollingInterval, settings.enabled ? 1 : 0],
        cb
    );
} 