"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation"; // Tambahkan useRouter
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar"; 
import Navbar from "@/components/layout/navbar";   
import { Loader2 } from "lucide-react";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Tambahkan Logika Redirect Otomatis
  useEffect(() => {
    if (isReady && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isReady, isAuthenticated, pathname, router]);

  // 1. Tampilkan loading spinner saat mengecek session
  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. Jika di halaman login, tampilkan tanpa Sidebar/Navbar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 3. Layout Utama (Hanya muncul jika Authenticated)
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {isAuthenticated && <Sidebar role={user?.role} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        {isAuthenticated && <Navbar />}
        
        <main className={`flex-1 overflow-y-auto ${isAuthenticated ? "p-4 md:p-8" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}