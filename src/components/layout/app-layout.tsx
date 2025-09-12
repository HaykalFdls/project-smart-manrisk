"use client";

import { useAuth } from "@/context/auth-context";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 🔹 Daftar halaman publik (tidak perlu login)
  const publicRoutes = ["/login", "/register"];

  // 🔹 Redirect kalau belum login & bukan di public route
  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return <div className="p-4">⏳ Loading session...</div>;
  }

  // Kalau belum login dan route public → render langsung (tanpa sidebar)
  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Kalau sudah login → render dengan sidebar global
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
