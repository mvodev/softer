import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './authState';
import fileReducer from './loadState';

export const store = configureStore({
  reducer: {
    auth:authReducer,
    file:fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          'payload.headers',
          'payload.config.transformRequest',
          'payload.config.transformResponse',
          'payload.config.env.FormData',
          'payload.config.env.Blob',
          'payload.config.validateStatus',
          'payload.config.headers',
          'payload.request',
        ],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;