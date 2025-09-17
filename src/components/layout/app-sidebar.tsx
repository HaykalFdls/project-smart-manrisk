"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  GitMerge,
  Landmark,
  Waves,
  ShieldAlert,
  ServerCog,
  ShieldCheck,
  FileText,
  Gavel,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type SubMenuItem = {
  name: string;
  href: string;
};

type MenuItem = {
  icon: LucideIcon;
  title: string;
  href?: string;
  submenu?: SubMenuItem[];
};

const mainNavItems: MenuItem[] = [
  { icon: LayoutDashboard, title: "Dashboard", href: "/dashboard" },
  {
    icon: GitMerge,
    title: "Risk Integration",
    submenu: [
      { name: "Dashboard & Report", href: "#" },
      { name: "Tingkat Kesehatan Bank (TKB)", href: "#" },
      { name: "Profil Risiko Bankwide", href: "#" },
      { name: "ICAAP", href: "#" },
      { name: "RAS", href: "#" },
      { name: "Risk Register", href: "/risk-register" },
      { name: "KRI", href: "#" },
      { name: "EWS", href: "#" },
      { name: "Profil Risiko Cabang", href: "#" },
      { name: "RMI", href: "#" },
      { name: "ICoFR", href: "#" },
      { name: "KMR", href: "#" },
    ],
  },
  // (komentar lainnya tetap seperti semula)
  {
    icon: ShieldAlert,
    title: "Operational Risk",
    submenu: [
      { name: "Dashboard & Report", href: "#" },
      { name: "Risk Control Self-Assessment (RCSA)", href: "/rcsa" },
      { name: "Loss Event Database (LED)", href: "#" },
      { name: "ATMR Risiko Operasional", href: "#" },
      { name: "Risk Profile & Risk Limit", href: "#" },
      { name: "Risk Self-Assessment (RSA)", href: "#" },
      { name: "Stress Test Operasional", href: "#" },
    ],
  },
  { icon: FileText, title: "Regulation Update", href: "#" },
  { icon: Gavel, title: "Governance & Compliance", href: "#" },
];

const adminNavItems: MenuItem[] = [
  {
    icon: Shield,
    title: "Admin RCSA",
    submenu: [
      { name: "Kelola Master RCSA", href: "/admin/rcsa-management" },
      { name: "Laporan RCSA", href: "/admin/rcsa-report" },
    ],
  },
  {
    icon: Shield,
    title: "Admin Risk Register",
    submenu: [
      { name: "Kelola Risk Register", href: "/admin/risk-management" },
      { name: "Laporan Risk Register", href: "/admin/risk-report" },
    ],
  },
];

const footerNavItems: MenuItem[] = [{ icon: Settings, title: "Settings", href: "#" }];

const NavItemWithSubmenu = ({
  icon: Icon,
  title,
  submenu,
}: {
  icon: LucideIcon;
  title: string;
  submenu: SubMenuItem[];
}) => {
  const pathname = usePathname();
  const isAnySubmenuActive = submenu.some(
    (item) => pathname.startsWith(item.href) && item.href !== "#"
  );
  const [isOpen, setIsOpen] = useState(isAnySubmenuActive);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setIsOpen(isAnySubmenuActive);
    }
  }, [isAnySubmenuActive, pathname, isClient]);

  if (!isClient) {
    return (
      <SidebarMenuButton className="justify-between w-full" isActive={isAnySubmenuActive}>
        <div className="flex items-center gap-2">
          <Icon />
          <span>{title}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </SidebarMenuButton>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="justify-between w-full" isActive={isAnySubmenuActive}>
          <div className="flex items-center gap-2">
            <Icon />
            <span>{title}</span>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </SidebarMenuButton>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <SidebarMenuSub>
          {submenu.map((item) => (
            <SidebarMenuSubItem key={item.name}>
              <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="whitespace-normal h-auto">
                  {item.name}
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

const NavItem = ({ item }: { item: MenuItem }) => {
  const { icon: Icon, title, submenu, href } = item;
  const pathname = usePathname();
  const isActive = href === pathname;

  if (submenu) {
    return <NavItemWithSubmenu icon={Icon} title={title} submenu={submenu} />;
  }

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={href || "#"}>
        <Icon />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
};

export function AppSidebar() {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  // <-- PERBAIKAN: definisi collapsed & setter
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setShowConfirm(false);
  };

  return (
    <>
      {/* keep collapsible prop as original - do not change menu logic */}
      <Sidebar collapsible="icon">
        <div className="flex h-full flex-col">
          {/* Logo + SMART */}
          <SidebarHeader className="p-4">
            <Link href="/" className="flex flex-col items-center gap-2 text-sidebar-foreground">
              <img
                src="/images/logo_bjbs.png"
                alt="SMART Logo"
                className={cn("transition-all", collapsed ? "h-10 w-10" : "h-12 w-auto")}
              />
              {!collapsed && <span className="text-xl font-semibold">SMART</span>}
            </Link>
          </SidebarHeader>

          {/* Menu (tetap pakai menu + submenu asli kamu) */}
          <SidebarContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavItem item={item} />
                </SidebarMenuItem>
              ))}

              <div className="p-2 pt-4">
                <motion.h4
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: collapsed ? 0 : 1, scale: collapsed ? 0.8 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-2"
                >
                  Admin Tools
                </motion.h4>
              </div>

              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavItem item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer + tombol logout + collapse */}
          <SidebarFooter>
            <SidebarMenu>
              {footerNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavItem item={item} />
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowConfirm(true)}
                  className="text-red-500 hover:text-red-700"
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
      </Sidebar>

      {/* Modal Konfirmasi Logout */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin logout?</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Ya, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
