import { BottomNav } from "@/components/navigation/bottom-nav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-16">
      <main className="px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
