import type { Metadata } from 'next';
import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

import { Inter } from 'next/font/google';
import { AuthProvider } from "@/hooks/auth-provide"; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SMART',
  description: 'Smart Login Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SidebarProvider>
            <Sidebar>
              <AppSidebar />
            </Sidebar>
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
