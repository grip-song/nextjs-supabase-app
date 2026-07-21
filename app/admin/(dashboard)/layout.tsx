import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 방어적 이중 검증: 미들웨어가 matcher 예외 등으로 우회되는 상황을 대비해
  // 레이아웃 자체에서도 관리자 권한을 재확인한다.
  // Fluid compute 환경 대응을 위해 Supabase 클라이언트는 함수 내에서 매번 새로 생성한다.
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/admin/login");
  }

  // user_metadata는 로그인한 본인이 조작 가능하므로 신뢰할 수 없다.
  // 반드시 서버 측 신뢰 소스인 public.users.role 컬럼을 조회해서 판정한다.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.sub)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
