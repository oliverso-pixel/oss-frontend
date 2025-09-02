// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Users, Compass, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "儀表板", icon: Home },
  { href: "/pets", label: "我的寵物", icon: PawPrint },
  { href: "/explore", label: "探索用戶", icon: Compass },
  { href: "/friends", label: "好友列表", icon: Users },
  { href: "/friends/requests", label: "好友請求", icon: UserPlus },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-secondary/40 p-4 hidden md:block">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              // 使用 startsWith 來高亮父路由
              pathname.startsWith(item.href) && "bg-primary/10 text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}