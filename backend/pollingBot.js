const TelegramBot = require('node-telegram-bot-api');
const { getBotSettings } = require('./services/botSettingsService');
const { getAlertSettings, setAlertSettings } = require('./services/settingsService');

let currentBot = null;
let currentToken = null;

function registerHandlers(bot) {
    bot.onText(/\/set_whale (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getAlertSettings((settings) => {
            setAlertSettings({ ...settings, greenRed: value }, () => {
                bot.sendMessage(msg.chat.id, `Whale limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_dolphin (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getAlertSettings((settings) => {
            setAlertSettings({ ...settings, blueYellow: value }, () => {
                bot.sendMessage(msg.chat.id, `Dolphin limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_refresh (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getAlertSettings((settings) => {
            setAlertSettings({ ...settings, pollingInterval: value }, () => {
                bot.sendMessage(msg.chat.id, `Refresh time set to ${value} seconds`);
            });
        });
    });

    bot.onText(/\/get_settings/, (msg) => {
        getAlertSettings((settings) => {
            bot.sendMessage(
                msg.chat.id,
                `Current settings:\nWhale: $${settings.greenRed}\nDolphin: $${settings.blueYellow}\nRefresh: ${settings.pollingInterval} sec\nEnabled: ${settings.enabled ? 'yes' : 'no'}`
            );
        });
    });

    bot.onText(/\/enable/, (msg) => {
        getAlertSettings((settings) => {
            setAlertSettings({ ...settings, enabled: true }, () => {
                bot.sendMessage(msg.chat.id, `Notifications enabled.`);
            });
        });
    });

    bot.onText(/\/disable/, (msg) => {
        getAlertSettings((settings) => {
            setAlertSettings({ ...settings, enabled: false }, () => {
                bot.sendMessage(msg.chat.id, `Notifications disabled.`);
            });
        });
    });

    bot.onText(/\/help/, (msg) => {
        bot.sendMessage(
            msg.chat.id,
            `Available commands:\n/set_whale <amount> - Set whale limit\n/set_dolphin <amount> - Set dolphin limit\n/set_refresh <seconds> - Set refresh time\n/get_settings - Show current settings\n/enable - Enable notifications\n/disable - Disable notifications`
        );
    });
}

function startPollingBot() {
    function startBotWithToken(token) {
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
    getBotSettings((settings) => {
        if (settings.botToken) {
            startBotWithToken(settings.botToken);
        }
    });

    // Watch for token changes
    setInterval(() => {
        getBotSettings((settings) => {
            if (settings.botToken !== currentToken) {
                startBotWithToken(settings.botToken);
            }
        });
    }, 10000); // Check every 10 seconds
}

module.exports = startPollingBot; 