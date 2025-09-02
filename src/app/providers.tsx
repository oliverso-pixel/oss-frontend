// src/app/providers.tsx
"use client";

import { Provider } from 'react-redux';
import { store } from '../store/store';
import setupAxiosInterceptors from '../lib/apiInterceptor';

setupAxiosInterceptors();

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}