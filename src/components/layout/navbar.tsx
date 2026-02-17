"use client";

import { useAuth } from "@/context/auth-context";
import { LogOut, User as UserIcon, Bell, ChevronDown, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30 w-full">
      <div className="flex items-center gap-2 text-slate-500">
        <Building2 size={18} className="text-blue-600" />
        <span className="text-sm font-medium uppercase text-slate-800">
          {user?.unit_name || "Divisi Belum Diatur"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.name || "User"}</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserIcon size={20} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}