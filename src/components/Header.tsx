// src/components/Header.tsx
"use client";

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { LogOut, PawPrint } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, but proceeding with client-side logout.", error);
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container h-14 flex items-center">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2 mr-6">
          <PawPrint className="h-6 w-6" />
          PetSocial
        </Link>
        <div className="flex-1">
          {/* 未來可以放主要導航 */}
        </div>
        <div className="flex items-center gap-2">
          {isClient ? (
            token && user ? (
              <>
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  歡迎, {user.display_name || user.username}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="登出">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">登入</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">註冊</Link>
                </Button>
              </>
            )
          ) : (
            <div className="h-10 w-24"></div>
          )}
        </div>
      </nav>
    </header>
  );
}