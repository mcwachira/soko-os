'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { ProvidersLayout } from '@/app/providers-layout';
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
import { ProductSwitcher } from '@/components/product/product-switcher';

const platformNavigation: Array<{ title: string; product: string | null; items: Array<{ title: string; href: string; icon: React.ComponentType<{ className?: string }>; product: string | null }> }> = [
  {
    title: 'Platform',
    product: null,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, product: null },
      { title: 'Settings', href: '/settings', icon: Settings, product: null },
      { title: 'Help', href: '/help', icon: HelpCircle, product: null },
    ],
  },
];

function PlatformSidebar() {
  const pathname = usePathname();
  const { entitlements, isSuperAdmin } = useAuth();

  const visibleGroups = platformNavigation.map((group) => {
    if (!group.product) {
      return group;
    }
    if (isSuperAdmin || entitlements[group.product.toLowerCase()]) {
      return group;
    }
    return null;
  }).filter((group): group is NonNullable<typeof platformNavigation[0]> => group !== null);

  return (
    <Sidebar variant="inset" className="border-r-2 border-black">
      <SidebarHeader className="p-4 border-b-2 border-black">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight">Soko-OS</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleGroups.map((group: NonNullable<typeof platformNavigation[0]>) => (
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
        <ProductSwitcher />
        <div className="mt-4 text-xs font-bold text-muted-foreground">
          Soko-OS v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProvidersLayout>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <PlatformSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-black bg-secondary-background px-4">
              <SidebarTrigger className="border-2 border-black" />
              <div className="flex-1">
                {/* Business selector and global search will be added here */}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProvidersLayout>
  );
}