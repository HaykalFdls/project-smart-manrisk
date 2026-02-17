"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShieldCheck, 
  FileBarChart, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

// Pastikan menggunakan "export default function Sidebar"
export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isAdmin = role === "admin";

  // Menu dasar untuk semua user
  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={20}/>, label: "Dashboard" },
    { href: "/risk-register", icon: <ClipboardList size={20}/>, label: "Risk Register" },
  ];

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col min-h-screen shadow-xl">
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">B</div>
          <span className="text-xl font-bold tracking-tight">SMART <span className="text-blue-400">Manrisk</span></span>
        </div>
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === item.href 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Khusus Admin - Muncul jika role adalah 'admin' */}
        {isAdmin && (
          <div className="pt-8 space-y-1">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Tools</p>
            <Link 
              href="/admin/approval" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/admin/approval" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ShieldCheck size={20}/>
              <span className="font-medium">Persetujuan</span>
            </Link>
            <Link 
              href="/admin/risk-report" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/admin/risk-report" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileBarChart size={20}/>
              <span className="font-medium">Laporan LRS</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Section (Settings & Logout) */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link 
          href="/settings" 
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
        >
          <Settings size={20}/>
          <span className="font-medium">Settings</span>
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={20}/>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}