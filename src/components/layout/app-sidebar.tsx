
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
import { usePathname } from 'next/navigation';

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
  { icon: LayoutDashboard, title: 'Dashboard', href: '/' },
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
      { name: 'Risk Register', href: '/risk-register' },
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
    title: 'Liquidity & Market Risk',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'LCR', href: '#' },
      { name: 'Risk Profile & Risk Limit', href: '#' },
      { name: 'NSFR', href: '#' },
      { name: 'Stress Test Likuiditas dan Pasar', href: '#' },
      { name: 'ATMR Risiko Pasar', href: '#' },
      { name: 'IRRBB', href: '#' },
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Operational Risk',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Risk Control Self-Assessment (RCSA)', href: '/rcsa' },
      { name: 'Loss Event Database (LED)', href: '#' },
      { name: 'ATMR Risiko Operasional', href: '#' },
      { name: 'Risk Profile & Risk Limit', href: '#' },
      { name: 'Risk Self-Assessment (RSA)', href: '#' },
      { name: 'Stress Test Operasional', href: '#' },
    ],
  },
  {
    icon: ServerCog,
    title: 'IT Risk Management',
    submenu: [
      { name: 'Dashboard & Report', href: '#' },
      { name: 'Profil Risiko Ketahanan & Keamanan Siber', href: '#' },
      { name: 'Tingkat Maturitas Digital Bank', href: '#' },
      { name: 'CSIRT', href: '#' },
      { name: 'Risk Profile & Risk Limit', href: '#' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'BCMS',
    submenu: [
      { name: 'Dashboard & report', href: '#' },
      { name: 'Business Impact Analysis', href: '#' },
      { name: 'Risk & Threat Assessment', href: '#' },
      { name: 'Business Continuity Plan (BCP)', href: '#' },
      { name: 'Disaster Recovery Plan (DRP)', href: '#' },
      { name: 'Recovery & Resolution Plan', href: '#' },
    ],
  },
  { icon: FileText, title: 'Regulation Update', href: '#' },
  { icon: Gavel, title: 'Governance & Compliance', href: '#' },
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
  const pathname = usePathname();
  const isAnySubmenuActive = submenu.some(item => item.href === pathname);
  const [isOpen, setIsOpen] = useState(isAnySubmenuActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="justify-between w-full" isActive={isAnySubmenuActive}>
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
              <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                <Link href={item.href} className="whitespace-normal h-auto">{item.name}</Link>
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
          <Link href="/" className="flex flex-col items-center gap-2 text-sidebar-foreground">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-8 w-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-semibold">
              SMART
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
