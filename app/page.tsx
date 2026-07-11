import { GoogleLoginButton } from "@/components/google-login-button";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, Users, Smartphone } from "lucide-react";

const FEATURES = [
  {
    icon: Link2,
    title: "초대 링크 하나로 시작",
    description:
      "이벤트를 만들고 링크만 공유하면 끝, 복잡한 가입 절차가 없어요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 확인",
    description: "누가 참여했는지 실시간으로 확인하고 준비를 챙길 수 있어요.",
  },
  {
    icon: Smartphone,
    title: "모바일에 최적화",
    description: "언제 어디서나 폰으로 간편하게 이벤트를 관리할 수 있어요.",
  },
] as const;

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Gather
          </h1>
          <p className="text-balance text-muted-foreground">
            초대 링크 하나로 이벤트를 간편하게
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="text-left">
              <CardContent className="flex items-start gap-3 p-4">
                <feature.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full">
          <GoogleLoginButton />
        </div>
      </div>
    </main>
  );
}
