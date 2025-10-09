// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Users, Compass, UserPlus, Settings, UserCheck, Heart, Search, Repeat, Rss } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSelector(state => state.auth);

  const navItems = [
    { href: "/dashboard", label: "儀表板", icon: Home },
    { href: "/feed", label: "動態牆", icon: Rss },
    { href: "/pets", label: "我的寵物", icon: PawPrint },
    { href: "/pets/search", label: "搜尋寵物", icon: Search },
    { href: "/transfer-center", label: "轉移中心", icon: Repeat },
    { href: `/users/${user?.id}`, label: "我的主頁", icon: UserCheck, isVisible: !!user },
    { href: "/explore", label: "探索用戶", icon: Compass },
    { href: "/friends", label: "好友列表", icon: Users },
    { href: "/friends/requests", label: "好友請求", icon: UserPlus },
    { href: "/following", label: "我關注誰", icon: Heart },
    { href: "/followers", label: "誰關注我", icon: Users },
    { href: "/settings", label: "設定", icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-secondary/40 p-4 hidden md:block">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          item.isVisible !== false && (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === item.href && "bg-primary/10 text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        ))}
      </nav>
    </aside>
  );
}