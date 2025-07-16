const axios = require('axios');
const mapAction = require('../utils/mapAction');
const { getSettings } = require('./settingsService');
const { sendTelegramMessage } = require('./telegramService');
const { formatSwapMessage } = require('../utils/formatMessage');

const VANAHEIMEX_API = 'https://vanaheimex.com/actions?limit=10&asset=THOR.RUJI&type=swap';
let lastNotifiedTxids = new Set();
let schedulerInterval = null;

function runScheduler() {
    getSettings(async (settings) => {
        if (!settings.enabled || !settings.botToken || !settings.chatId) return;
        try {
            const { data } = await axios.get(VANAHEIMEX_API);
            const actions = Array.isArray(data) ? data : data.actions || data.data || [];
            for (const apiAction of actions) {
                const action = mapAction(apiAction);
                const txid = action.in?.[0]?.txID;
                if (!txid || lastNotifiedTxids.has(txid)) continue;
                // Whale detection (input or output value > greenRed)
                if (action.maxValue >= settings.greenRed) {
                    const msg = formatSwapMessage(action);
                    try {
                        await sendTelegramMessage({
                            botToken: settings.botToken,
                            chatId: settings.chatId,
                            message: msg,
                            parse_mode: 'HTML',
                        });
                        lastNotifiedTxids.add(txid);
                    } catch (e) {
                        // Ignore send errors
                    }
                }
            }
            // Keep deduplication set small
            if (lastNotifiedTxids.size > 1000) lastNotifiedTxids = new Set(Array.from(lastNotifiedTxids).slice(-500));
        } catch (e) {
            // Ignore fetch errors
        }
    });
}

function startScheduler() {
    if (schedulerInterval) clearInterval(schedulerInterval);
    // Initial run
    runScheduler();
    // Polling interval from settings
    getSettings((settings) => {
        const interval = (settings.pollingInterval || 30) * 1000;
        schedulerInterval = setInterval(runScheduler, interval);
    });
}

module.exports = { startScheduler }; 