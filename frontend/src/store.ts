import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'https://whalehuntraw-production.up.railway.app';
// const API_BASE_URL = './';

type AlertSettings = {
    greenRed: number;
    blueYellow: number;
    enabled: boolean;
    pollingInterval: number;
};

type BotSettings = {
    botToken: string;
    chatId: string;
};

export const alertApi = createApi({
    reducerPath: 'alertApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    endpoints: (builder) => ({
        getAlertSettings: builder.query<AlertSettings, void>({
            query: () => 'alert-settings',
        }),
        updateAlertSettings: builder.mutation<AlertSettings, Partial<AlertSettings>>({
            query: (settings: Partial<AlertSettings>) => ({
                url: 'alert-settings',
                method: 'POST',
                body: settings,
            }),
        }),
    }),
});

export const botApi = createApi({
    reducerPath: 'botApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    endpoints: (builder) => ({
        getBotSettings: builder.query<BotSettings, void>({
            query: () => 'bot-settings',
        }),
        updateBotSettings: builder.mutation<BotSettings, Partial<BotSettings>>({
            query: (settings: Partial<BotSettings>) => ({
                url: 'bot-settings',
                method: 'POST',
                body: settings,
            }),
        }),
        sendTestNotification: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: 'test',
                method: 'POST',
            }),
        }),
    }),
});

export const store = configureStore({
    reducer: {
        [alertApi.reducerPath]: alertApi.reducer,
        [botApi.reducerPath]: botApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(alertApi.middleware, botApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const {
    useGetAlertSettingsQuery,
    useUpdateAlertSettingsMutation,
} = alertApi;

export const {
    useGetBotSettingsQuery,
    useUpdateBotSettingsMutation,
    useSendTestNotificationMutation,
} = botApi; 