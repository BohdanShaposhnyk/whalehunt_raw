# Whalehunt Backend

A backend-first service to fetch actions, detect whale events, and send Telegram notifications. Minimal REST API for settings and test notification.

## Features
- Fetches actions from external API
- Detects whale events and sends Telegram notifications
- Stores settings in SQLite
- REST API for settings and test notification

## Endpoints
- `GET /settings` — Get current settings
- `POST /settings` — Update settings (JSON: botToken, chatId, enabled, greenRed, blueYellow, pollingInterval)
- `POST /test` — Send a test Telegram notification

## Usage
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend:
   ```bash
   npm start
   ```
3. Configure your Telegram bot and settings via the REST API or frontend.

## Settings Table
- `botToken`: Telegram bot token
- `chatId`: Telegram chat ID
- `enabled`: 1/0 (enable/disable notifications)
- `greenRed`: Whale threshold (USD)
- `blueYellow`: Dolphin threshold (USD)
- `pollingInterval`: Fetch interval (seconds)
