import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'https://whalehuntraw-production.up.railway.app'; // Assumes same origin, adjust if needed
// const API_BASE_URL = '/'; // Assumes same origin, adjust if needed

type Settings = {
    botToken: string;
    chatId: string;
    enabled: boolean;
    greenRed: number;
    blueYellow: number;
    pollingInterval: number;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    endpoints: (builder) => ({
        getSettings: builder.query<Settings, void>({
            query: () => 'settings',
        }),
        updateSettings: builder.mutation<Settings, Partial<Settings>>({
            query: (settings: Partial<Settings>) => ({
                url: 'settings',
                method: 'POST',
                body: settings,
            }),
        }),
        testTelegram: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: 'test',
                method: 'POST',
            }),
        }),
    }),
});

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useTestTelegramMutation,
} = apiSlice; 