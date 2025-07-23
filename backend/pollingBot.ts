import TelegramBot, { Message } from 'node-telegram-bot-api';
import { getBotSettings, BotSettings } from './services/botSettingsService.js';
import { getAlertSettings, setAlertSettings, AlertSettings } from './services/settingsService.js';

let currentBot: TelegramBot | null = null;
let currentToken: string | null = null;

function registerHandlers(bot: TelegramBot): void {
    bot.onText(/\/set_whale (\d+)/, (msg: Message, match: RegExpExecArray | null) => {
        if (!match) return;
        const value = parseInt(match[1]);
        getAlertSettings((settings: AlertSettings) => {
            setAlertSettings({ ...settings, greenRed: value }, () => {
                bot.sendMessage(msg.chat.id, `Whale limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_dolphin (\d+)/, (msg: Message, match: RegExpExecArray | null) => {
        if (!match) return;
        const value = parseInt(match[1]);
        getAlertSettings((settings: AlertSettings) => {
            setAlertSettings({ ...settings, blueYellow: value }, () => {
                bot.sendMessage(msg.chat.id, `Dolphin limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_refresh (\d+)/, (msg: Message, match: RegExpExecArray | null) => {
        if (!match) return;
        const value = parseInt(match[1]);
        getAlertSettings((settings: AlertSettings) => {
            setAlertSettings({ ...settings, pollingInterval: value }, () => {
                bot.sendMessage(msg.chat.id, `Refresh time set to ${value} seconds`);
            });
        });
    });

    bot.onText(/\/get_settings/, (msg: Message) => {
        getAlertSettings((settings: AlertSettings) => {
            bot.sendMessage(
                msg.chat.id,
                `Current settings:\nWhale: $${settings.greenRed}\nDolphin: $${settings.blueYellow}\nRefresh: ${settings.pollingInterval} sec\nEnabled: ${settings.enabled ? 'yes' : 'no'}`
            );
        });
    });

    bot.onText(/\/enable/, (msg: Message) => {
        getAlertSettings((settings: AlertSettings) => {
            setAlertSettings({ ...settings, enabled: true }, () => {
                bot.sendMessage(msg.chat.id, `Notifications enabled.`);
            });
        });
    });

    bot.onText(/\/disable/, (msg: Message) => {
        getAlertSettings((settings: AlertSettings) => {
            setAlertSettings({ ...settings, enabled: false }, () => {
                bot.sendMessage(msg.chat.id, `Notifications disabled.`);
            });
        });
    });

    bot.onText(/\/help/, (msg: Message) => {
        bot.sendMessage(
            msg.chat.id,
            `Available commands:\n/set_whale <amount> - Set whale limit\n/set_dolphin <amount> - Set dolphin limit\n/set_refresh <seconds> - Set refresh time\n/get_settings - Show current settings\n/enable - Enable notifications\n/disable - Disable notifications`
        );
    });
}

function startPollingBot(): void {
    function startBotWithToken(token: string | null): void {
        if (currentBot) {
            currentBot.stopPolling();
            currentBot = null;
        }
        if (!token) return;
        currentBot = new TelegramBot(token, { polling: true });
        currentToken = token;
        registerHandlers(currentBot);
        console.log('Polling bot started.');
    }

    // Initial start
    getBotSettings((settings: BotSettings) => {
        if (settings.botToken) {
            startBotWithToken(settings.botToken);
        }
    });

    // Watch for token changes
    setInterval(() => {
        getBotSettings((settings: BotSettings) => {
            if (settings.botToken !== currentToken) {
                startBotWithToken(settings.botToken);
            }
        });
    }, 10000); // Check every 10 seconds
}

export default startPollingBot; 