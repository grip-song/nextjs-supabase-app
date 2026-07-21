"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarDays },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-gray-900 text-gray-100">
      <div className="flex h-16 items-center px-6 text-lg font-bold">
        Gather Admin
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-12 items-center gap-3 rounded-md px-4 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-300 hover:bg-gray-800",
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex h-12 items-center gap-3 px-6 text-sm text-gray-300 hover:bg-gray-800"
      >
        <LogOut size={20} />
        로그아웃
      </button>
    </aside>
  );
}
