"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/app-layout";
import GlobalLoading from "@/components/common/GlobalLoading";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isReady } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isReady) {
    return <GlobalLoading />; 
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={inter.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
