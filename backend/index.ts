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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start services with error handling
try {
    startScheduler();
    console.log('Scheduler started');
} catch (error) {
    console.error('Failed to start scheduler:', error);
}

try {
    startPollingBot();
    console.log('Polling bot started');
} catch (error) {
    console.error('Failed to start polling bot:', error);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
}); 