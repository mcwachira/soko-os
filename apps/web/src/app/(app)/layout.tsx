'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BookOpen,
  TrendingUp,
  Settings,
  HelpCircle,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  RotateCcw,
  Wallet,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  {
    title: 'Overview',
    product: null,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, product: null },
    ],
  },
  {
    title: 'SELL',
    product: 'pos',
    items: [
      { title: 'POS', href: '/pos', icon: ShoppingCart, product: 'pos' },
      { title: 'Sales', href: '/sales', icon: ShoppingBag, product: 'pos' },
      { title: 'Orders', href: '/orders', icon: ClipboardList, product: 'pos' },
      { title: 'Returns', href: '/returns', icon: RotateCcw, product: 'pos' },
      { title: 'Cash & Shifts', href: '/shifts', icon: Wallet, product: 'pos' },
    ],
  },
  {
    title: 'COMMERCE',
    product: 'commerce',
    items: [
      { title: 'Products', href: '/products', icon: Package, product: 'commerce' },
      { title: 'Inventory', href: '/inventory', icon: Package, product: 'commerce' },
      { title: 'Customers', href: '/customers', icon: Users, product: 'commerce' },
      { title: 'Suppliers', href: '/suppliers', icon: Truck, product: 'commerce' },
      { title: 'Purchasing', href: '/purchasing', icon: Truck, product: 'commerce' },
    ],
  },
  {
    title: 'BOOKS',
    product: 'books',
    items: [
      { title: 'Accounting', href: '/accounting', icon: BookOpen, product: 'books' },
      { title: 'Invoices', href: '/invoices', icon: BookOpen, product: 'books' },
      { title: 'Expenses', href: '/expenses', icon: BookOpen, product: 'books' },
      { title: 'Receivables', href: '/receivables', icon: BookOpen, product: 'books' },
      { title: 'Payables', href: '/payables', icon: BookOpen, product: 'books' },
    ],
  },
  {
    title: 'INSIGHTS',
    product: 'insights',
    items: [
      { title: 'Analytics', href: '/analytics', icon: TrendingUp, product: 'insights' },
      { title: 'Reports', href: '/reports', icon: BarChart3, product: 'insights' },
    ],
  },
  {
    title: 'SYSTEM',
    product: null,
    items: [
      { title: 'Settings', href: '/settings', icon: Settings, product: null },
      { title: 'Help', href: '/help', icon: HelpCircle, product: null },
    ],
  },
];

function EntitlementGuard({ children, product }: { children: React.ReactNode; product: string | null }) {
  const { entitlements, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (product && !isSuperAdmin && !entitlements[product.toLowerCase()]) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-lg border-2 border-black bg-secondary-background p-6 text-center">
          <Lock className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-black mb-2">Product Not Available</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is not included in your current subscription. Please contact your administrator or upgrade your plan.
          </p>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/settings/subscription">View Subscription</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppSidebar() {
  const pathname = usePathname();
  const { entitlements, isSuperAdmin } = useAuth();

  const visibleGroups = navigation.map((group) => {
    if (!group.product) {
      return group;
    }
    if (isSuperAdmin || entitlements[group.product.toLowerCase()]) {
      return group;
    }
    return null;
  }).filter((group): group is NonNullable<typeof navigation[0]> => group !== null);

  return (
    <Sidebar variant="inset" className="border-r-2 border-black">
      <SidebarHeader className="p-4 border-b-2 border-black">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight">Soko-OS</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleGroups.map((group: NonNullable<typeof navigation[0]>) => (
            <div key={group.title} className="mb-4">
              <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t-2 border-black">
        <div className="text-xs font-bold text-muted-foreground">
          Soko-OS v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-black bg-secondary-background px-4">
            <SidebarTrigger className="border-2 border-black" />
            <div className="flex-1">
              {/* Business selector and global search will be added here */}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* User menu and notifications will be added here */}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <EntitlementGuard product={null}>
              {children}
            </EntitlementGuard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
