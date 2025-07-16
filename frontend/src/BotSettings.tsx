import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useGetBotSettingsQuery, useUpdateBotSettingsMutation } from './store';

const BotSettings: React.FC = () => {
    const { data, isLoading, isError, refetch } = useGetBotSettingsQuery();
    const [updateBotSettings, { isLoading: isSaving, isSuccess: isSaved, isError: isSaveError, error: saveError }] = useUpdateBotSettingsMutation();

    const [form, setForm] = useState({
        botToken: '',
        chatId: '',
    });

    React.useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateBotSettings(form);
        refetch();
    };

    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">Failed to load bot settings.</Alert>;

    return (
        <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>Bot Settings</Typography>
            <form onSubmit={handleSave}>
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
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={isSaving}>
                        {isSaving ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </Box>
                {isSaved && <Alert severity="success" sx={{ mt: 2 }}>Bot settings saved!</Alert>}
                {isSaveError && <Alert severity="error" sx={{ mt: 2 }}>{(saveError as any)?.data?.message || 'Failed to save.'}</Alert>}
            </form>
        </Paper>
    );
};

export default BotSettings; 