// src/components/AuthGuard.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !token) {
      router.push('/login');
    }
  }, [token, router, isClient]);

  if (!isClient || !token) {
    return null; // 或者可以顯示一個載入中的畫面
  }

  return token ? <>{children}</> : null;
}

