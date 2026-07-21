"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLoginButton } from "@/components/google-login-button";

/**
 * 로그인은 성공했지만 관리자 권한이 없어 (dashboard)/layout.tsx가 되돌려보낸 경우를 안내한다.
 * <Toaster />가 app/layout.tsx에서 {children}보다 뒤에 렌더링되어 마운트 이펙트도 나중에 실행되므로,
 * 마운트 시점에 곧바로 toast()를 호출하면 아직 구독 전이라 유실된다. 다음 매크로태스크로 미뤄서 회피한다.
 * useSearchParams() 사용부만 별도 컴포넌트로 분리해 Suspense로 감싼다 - 그렇지 않으면 프로덕션
 * 빌드(prerender) 시 "useSearchParams() should be wrapped in a suspense boundary" 에러로 실패한다.
 */
function ForbiddenErrorNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") !== "forbidden") return;

    const timer = setTimeout(() => {
      toast.error("관리자 권한이 없는 계정이에요");
    }, 0);
    router.replace("/admin/login");

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return null;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      toast.error("이메일 또는 비밀번호가 올바르지 않아요");
      setIsLoading(false);
      return;
    }

    // user_metadata는 조작 가능하므로 신뢰 가능한 public.users.role을 조회해 판정한다
    // (app/admin/(dashboard)/layout.tsx와 동일한 신뢰 소스/패턴).
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      toast.error("관리자 권한이 없는 계정이에요");
      setIsLoading(false);
      return;
    }

    toast.success("로그인되었습니다");
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <ForbiddenErrorNotice />
      </Suspense>
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호를 입력하여 관리자 페이지에 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "로그인"}
                </Button>
              </div>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground uppercase">
                  또는
                </span>
              </div>
            </div>

            <GoogleLoginButton redirectPath="/admin/dashboard" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
