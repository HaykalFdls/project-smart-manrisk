'use client';
import { useState } from 'react';
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
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  { icon: LayoutDashboard, title: 'Dashboard', href: '#' },
  {
    icon: GitMerge,
    title: 'Risk Integration',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Tingkat Kesehatan Bank (TKB)', href: '#' },
      { name: 'Profil Risiko Bankwide', href: '#' },
      { name: 'ICAAP', href: '#' },
      { name: 'RAS', href: '#' },
      { name: 'KRI', href: '#' },
      { name: 'EWS', href: '#' },
      { name: 'Profil Risiko Cabang', href: '#' },
      { name: 'RMI', href: '#' },
      { name: 'ICoFR', href: '#' },
      { name: 'KMR', href: '#' },
      { name: 'Risk Register', href: '#' },
    ],
  },
  {
    icon: Landmark,
    title: 'Credit & Investment Risk',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Root Cause of Credit Risk (RCCR)', href: '#' },
      { name: 'Portofolio Guideline', href: '#' },
      { name: 'Financing at Risk (FAR)', href: '#' },
      { name: 'First Payment Default (FPD)', href: '#' },
      { name: 'Risk Profile & Risk Limit', href: '#' },
      { name: 'Vintage Analysis', href: '#' },
      { name: 'Stress Test Kredit & Permodalan', href: '#' },
      { name: 'ATMR Risiko Kredit', href: '#' },
    ],
  },
  {
    icon: Waves,
    title: 'Liquidity & Market',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Stresstest Likuiditas', href: '#' },
      { name: 'ATMR Risiko Pasar', href: '#' },
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Operational Risk',
    submenu: [
      { name: 'Incidents', href: '#' },
      { name: 'KRI', href: '#' },
    ],
  },
  {
    icon: ServerCog,
    title: 'IT Risk Management',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'IT Risk Profile', href: '#' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'BCMS',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'BIA & Risk Assessment', href: '#' },
      { name: 'BCP & DRP', href: '#' },
      { name: 'Test & Maintenance', href: '#' },
    ],
  },
  {
    icon: FileText,
    title: 'Regulation Update',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Internal', href: '#' },
      { name: 'External', href: '#' },
    ],
  },
  {
    icon: Gavel,
    title: 'Governance & Compliance',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'GCG Self-Assessment', href: '#' },
      { name: 'Whistleblowing System (WBS)', href: '#' },
      { name: 'Anti-Fraud Strategy (SAF)', href: '#' },
    ],
  },
];

const footerNavItems: MenuItem[] = [
  { icon: Settings, title: 'Settings', href: '#' },
  { icon: LogOut, title: 'Logout', href: '#' },
];

const NavItemWithSubmenu = ({
  icon: Icon,
  title,
  submenu,
}: {
  icon: LucideIcon;
  title: string;
  submenu: SubMenuItem[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon />
            <span>{title}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {submenu.map((item) => (
            <SidebarMenuSubItem key={item.name}>
              <SidebarMenuSubButton asChild>
                <Link href={item.href}>{item.name}</Link>
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
  const isDashboard = title === 'Dashboard';

  if (submenu) {
    return <NavItemWithSubmenu icon={Icon} title={title} submenu={submenu} />;
  }

  return (
    <SidebarMenuButton asChild isActive={isDashboard}>
      <Link href={href || '#'}>
        <Icon />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
};

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <div className="flex h-full flex-col">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-sidebar-primary"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM12 13.667L6.667 11 12 8.333 17.333 11 12 13.667z" />
            </svg>
            <span className="text-xl font-semibold text-sidebar-foreground">
              RiskWise
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <NavItem item={item} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {footerNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <NavItem item={item} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
