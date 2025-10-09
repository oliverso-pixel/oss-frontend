// src/app/(protected)/dashboard/page.tsx
"use client";

import { useAppSelector } from '@/store/hooks';
import { PawPrint, Users, Rss } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <div>正在載入用戶資料...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">儀表板</h1>
      <h2 className="text-2xl mb-4">歡迎回來, {user.display_name || user.username}!</h2> 
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">動態牆</CardTitle>
            <Rss className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              看看好友與關注對象的最新動態。
            </p>
            <Link href="/feed" className="text-primary font-bold mt-2 inline-block">前往動態牆 &rarr;</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我的寵物</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              管理您的寵物資料與健康記錄。
            </p>
            <Link href="/pets" className="text-primary font-bold mt-2 inline-block">前往管理 &rarr;</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">探索用戶</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground">
              尋找新朋友並與他們建立聯繫。
            </p>
             <Link href="/explore" className="text-primary font-bold mt-2 inline-block">開始探索 &rarr;</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 建立一個基礎的 Card 組件以便儀表板使用
export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`bg-background rounded-xl border shadow ${className}`}>{children}</div>
}
export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 flex flex-col space-y-1.5 ${className}`}>{children}</div>
}
export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h3 className={`font-semibold tracking-tight text-2xl ${className}`}>{children}</h3>
}
export function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}

