import express, { Request, Response } from 'express';
import cors from 'cors';
import db from './db.js';
import botSettingsRoutes from './routes/botSettings.js';
import alertSettingsRoutes from './routes/alertSettings.js';
import testRoutes from './routes/test.js';
import { startScheduler } from './services/schedulerService.js';
import startPollingBot from './pollingBot.js';

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