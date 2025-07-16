import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, Switch, FormControlLabel } from '@mui/material';
import { useGetSettingsQuery, useUpdateSettingsMutation, useTestTelegramMutation } from './store';

const Settings: React.FC = () => {
    const { data, isLoading, isError, refetch } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isSaving, isSuccess: isSaved, isError: isSaveError, error: saveError }] = useUpdateSettingsMutation();
    const [testTelegram, { isLoading: isTesting, isSuccess: isTested, isError: isTestError }] = useTestTelegramMutation();

    const [form, setForm] = useState({
        botToken: '',
        chatId: '',
        enabled: true,
        greenRed: 0,
        blueYellow: 0,
        pollingInterval: 10,
    });

    React.useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings(form);
        refetch();
    };

    const handleTest = async () => {
        await testTelegram();
    };

    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">Failed to load settings.</Alert>;

    return (
        <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>Settings</Typography>
            <form onSubmit={handleSave}>
                <TextField
                    label="Whale Threshold (greenRed)"
                    name="greenRed"
                    type="number"
                    value={form.greenRed}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Dolphin Threshold (blueYellow)"
                    name="blueYellow"
                    type="number"
                    value={form.blueYellow}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Polling Interval (seconds)"
                    name="pollingInterval"
                    type="number"
                    value={form.pollingInterval}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Telegram Bot Token"
                    name="botToken"
                    value={form.botToken}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Telegram Chat ID"
                    name="chatId"
                    value={form.chatId}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={<Switch checked={!!form.enabled} onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))} name="enabled" />}
                    label="Enable Notifications"
                    sx={{ mt: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                        {isSaving ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                    <Button variant="outlined" onClick={handleTest} disabled={isTesting}>
                        {isTesting ? <CircularProgress size={24} /> : 'Send Test Notification'}
                    </Button>
                </Box>
                {isSaved && <Alert severity="success" sx={{ mt: 2 }}>Settings saved!</Alert>}
                {isSaveError && <Alert severity="error" sx={{ mt: 2 }}>{(saveError as any)?.data?.message || 'Failed to save.'}</Alert>}
                {isTested && <Alert severity="success" sx={{ mt: 2 }}>Test notification sent!</Alert>}
                {isTestError && <Alert severity="error" sx={{ mt: 2 }}>Failed to send test notification.</Alert>}
            </form>
        </Paper>
    );
};

export default Settings; 