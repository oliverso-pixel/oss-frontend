// src/components/AuthGuard.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // 等待客戶端狀態恢復後再檢查
    if (typeof window !== 'undefined' && !token) {
      router.push('/login');
    }
  }, [token, router]);

  // 如果 token 存在，渲染子組件；否則渲染 null 或 loading 狀態
  return token ? <>{children}</> : null;
}