import axios from 'axios';
import { mapAction, MappedAction } from '../utils/mapAction.js';
import { getAlertSettings, AlertSettings } from './settingsService.js';
import { sendTelegramMessage } from './telegramService.js';
import { formatSwapMessage } from '../utils/formatMessage.js';
import { getBotSettings, BotSettings } from './botSettingsService.js';

const MIDGARD_API = 'https://midgard.ninerealms.com/v2/actions?type=swap&limit=10&asset=THOR.RUJI';
let lastNotifiedTxids: Set<string> = new Set();
let schedulerInterval: NodeJS.Timeout | null = null;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

function runScheduler(): void {
    getAlertSettings(async (settings: AlertSettings) => {
        if (!settings.enabled) return;

        // Validate settings before proceeding
        if (!settings.greenRed || settings.greenRed <= 0) {
            console.log('Invalid whale threshold, skipping scheduler run');
            return;
        }

        try {
            const { data } = await axios.get(MIDGARD_API);
            const actions = Array.isArray(data) ? data : data.actions || data.data || [];

            for (const apiAction of actions) {
                try {
                    const action = mapAction(apiAction);
                    const txid = action.input.txID;
                    if (!txid || lastNotifiedTxids.has(txid)) continue;

                    // Whale detection (input or output value > greenRed)

                    const msg = action.maxValue >= settings.greenRed ? formatSwapMessage(action) : `DEBUG: ${action.maxValue} >= ${settings.greenRed} \n${JSON.stringify(action)}`;

                    // Get bot settings and validate before sending
                    getBotSettings(async (botSettings: BotSettings) => {
                        if (!botSettings.botToken || !botSettings.chatId) {
                            console.log('Bot credentials not configured, skipping notification');
                            return;
                        }

                        try {
                            await sendTelegramMessage({
                                botToken: botSettings.botToken,
                                chatId: botSettings.chatId,
                                message: msg,
                                parse_mode: 'HTML',
                            });
                            lastNotifiedTxids.add(txid);
                            console.log(`Notification sent for tx: ${txid}`);
                        } catch (telegramError) {
                            console.error('Telegram API error:', telegramError instanceof Error ? telegramError.message : String(telegramError));
                            // Don't add to notified set if sending failed
                        }
                    });

                } catch (actionError) {
                    console.error('Error processing action:', actionError instanceof Error ? actionError.message : String(actionError));
                    // Continue with next action
                }
            }

            // Keep deduplication set small
            if (lastNotifiedTxids.size > 1000) {
                lastNotifiedTxids = new Set(Array.from(lastNotifiedTxids).slice(-500));
            }
        } catch (e) {
            consecutiveErrors++;
            console.error('Failed to fetch actions:', e instanceof Error ? e.message : String(e));

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.error(`Too many consecutive errors (${consecutiveErrors}), stopping scheduler temporarily`);
                stopScheduler();
                return;
            }
        }

        // Reset error counter on successful run
        consecutiveErrors = 0;
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

export function restartScheduler(): void {
    stopScheduler();
    consecutiveErrors = 0;
    startScheduler();
} 