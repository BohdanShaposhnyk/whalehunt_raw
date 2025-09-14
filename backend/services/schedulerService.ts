import axios from 'axios';
import { mapAction, MappedAction } from '../utils/mapAction.js';
import { getAlertSettings, AlertSettings } from './settingsService.js';
import { sendTelegramMessage } from './telegramService.js';
import { formatSwapMessage } from '../utils/formatMessage.js';
import { getBotSettings, BotSettings } from './botSettingsService.js';

const VANAHEIMEX_API = 'https://vanaheimex.com/actions?limit=10&asset=THOR.RUJI&type=swap';
let lastNotifiedTxids: Set<string> = new Set();
let schedulerInterval: NodeJS.Timeout | null = null;

function runScheduler(): void {
    getAlertSettings(async (settings: AlertSettings) => {
        if (!settings.enabled) return;
        try {
            const { data } = await axios.get(VANAHEIMEX_API);
            const actions = Array.isArray(data) ? data : data.actions || data.data || [];
            for (const apiAction of actions) {
                const action: MappedAction = mapAction(apiAction);
                const txid = action.input.txID;
                if (!txid || lastNotifiedTxids.has(txid)) continue;
                // Whale detection (input or output value > greenRed)
                if (action.maxValue >= settings.greenRed) {
                    const msg = formatSwapMessage(action);
                    try {
                        getBotSettings(async (botSettings: BotSettings) => {
                            if (botSettings.botToken && botSettings.chatId) {
                                await sendTelegramMessage({
                                    botToken: botSettings.botToken,
                                    chatId: botSettings.chatId,
                                    message: msg,
                                    parse_mode: 'HTML',
                                });
                                lastNotifiedTxids.add(txid);
                                console.log(`Notification sent for tx: ${txid}`);
                            }
                        });
                    } catch (e) {
                        console.error('Failed to send notification:', e.message);
                    }
                }
            }
            // Keep deduplication set small
            if (lastNotifiedTxids.size > 1000) lastNotifiedTxids = new Set(Array.from(lastNotifiedTxids).slice(-500));
        } catch (e) {
            console.error('Failed to fetch actions:', e.message);
        }
    });
}

export function startScheduler(): void {
    if (schedulerInterval) clearInterval(schedulerInterval);
    // Initial run
    runScheduler();
    // Polling interval from settings
    getAlertSettings((settings: AlertSettings) => {
        const interval = (settings.pollingInterval || 30) * 1000;
        schedulerInterval = setInterval(runScheduler, interval);
    });
}

export function stopScheduler(): void {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
} 