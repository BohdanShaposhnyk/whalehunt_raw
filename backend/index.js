const express = require('express');
const cors = require('cors');
const db = require('./db');
const settingsRoutes = require('./routes/settings');
const testRoutes = require('./routes/test');
const { startScheduler } = require('./services/schedulerService');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/settings', settingsRoutes);
app.use('/test', testRoutes);

startScheduler();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
}); 