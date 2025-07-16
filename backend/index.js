const express = require('express');
const cors = require('cors');
const db = require('./db');
const botSettingsRoutes = require('./routes/botSettings');
const alertSettingsRoutes = require('./routes/alertSettings');
const testRoutes = require('./routes/test');
const { startScheduler } = require('./services/schedulerService');
const startPollingBot = require('./pollingBot');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/bot-settings', botSettingsRoutes);
app.use('/alert-settings', alertSettingsRoutes);
app.use('/test', testRoutes);

startScheduler();
startPollingBot();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
}); 