"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/events", label: "내 이벤트", icon: Calendar },
  { href: "/events/new", label: "새 이벤트", icon: PlusCircle },
  { href: "/profile", label: "프로필", icon: User },
];

interface BottomNavProps {
  /**
   * 현재 사용자의 역할. "participant"면 이벤트 생성 탭(FAB)을 숨긴다.
   * 실제 동적 role 판별(로그인 사용자별 host/participant 구분)은
   * Task 008 인증 연동 이후 적용 예정이며, 그 전까지는 기본값 "host"로 기존 동작을 유지한다.
   */
  role?: "host" | "participant";
}

export function BottomNav({ role = "host" }: BottomNavProps) {
  const pathname = usePathname();
  const items =
    role === "participant"
      ? NAV_ITEMS.filter((item) => item.href !== "/events/new")
      : NAV_ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center border-t bg-background">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const isCreate = href === "/events/new";

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {isCreate ? (
              <span className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Icon size={24} />
              </span>
            ) : (
              <Icon size={22} />
            )}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
