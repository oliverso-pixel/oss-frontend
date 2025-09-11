// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import petReducer from './petSlice';
import socialReducer from './socialSlice';
import transferReducer from './transferSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pets: petReducer,
    social: socialReducer,
    transfer: transferReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;