"use client";

import { useAuth } from "@/context/auth-context";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar";
import GlobalLoading from "@/components/common/GlobalLoading";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register"];

  // Redirect jika belum login
  useEffect(() => {
    if (isReady && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [isReady, user, pathname, router]);

  if (!isReady) return <GlobalLoading />;

  // Halaman publik (login, register)
  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Layout utama aplikasi
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar kiri */}
        <Sidebar className="flex-shrink-0 z-10">
          <AppSidebar />
        </Sidebar>

        {/* Konten utama */}
        <SidebarInset className="flex flex-1 flex-col bg-gray-50 overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
