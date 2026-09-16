'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { getProductConfig } from '@/config/product-config';
import { ProductSwitcher } from '@/components/product/product-switcher';
import {
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  RotateCcw,
  Wallet,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  Tag,
  Package,
  Hash,
  MapPin,
  RefreshCw,
  ArrowRightLeft,
  Boxes,
  DollarSign,
  TrendingUp,
  FileText,
  UserPlus,
  Handshake,
  PhoneCall,
  Target,
  Megaphone,
  Ticket,
  BookOpen,
} from 'lucide-react';

// Import product-specific theme CSS files
import '@/app/app/pos/theme.css';
import '@/app/app/crm/theme.css';
import '@/app/app/books/theme.css';
import '@/app/app/inventory/theme.css';
import '@/app/app/procurement/theme.css';
import '@/app/app/commerce/theme.css';
import '@/app/app/insights/theme.css';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  RotateCcw,
  Wallet,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  Tag,
  Package,
  Hash,
  MapPin,
  RefreshCw,
  ArrowRightLeft,
  Boxes,
  DollarSign,
  TrendingUp,
  FileText,
  UserPlus,
  Handshake,
  PhoneCall,
  Target,
  Megaphone,
  Ticket,
  BookOpen,
};

interface ProductLayoutProps {
  children: React.ReactNode;
  product: string;
}

export function ProductLayout({ children, product }: ProductLayoutProps) {
  const pathname = usePathname();
  const { entitlements, isSuperAdmin } = useAuth();
  const productConfig = getProductConfig(product);

  const isEntitled = productConfig
    ? isSuperAdmin || entitlements[product.toLowerCase()]
    : true;

  if (!isEntitled) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex min-h-screen flex-col w-full">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-black bg-secondary-background px-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight">Soko-OS</span>
              </Link>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="max-w-md rounded-lg border-2 border-black bg-secondary-background p-6 text-center">
                <h2 className="text-xl font-black mb-2">Product Not Available</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This feature is not included in your current subscription. Please contact your administrator or upgrade your plan.
                </p>
                <Button asChild className="border-2 border-black shadow w-full">
                  <a href="/settings/subscription">View Subscription</a>
                </Button>
              </div>
            </div>
          </main>
          </div>
        </div>
    );
  }

  const productNavigation = productConfig!.navigation;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" data-product={product}>
        <Sidebar variant="inset" className="border-r-2 border-black">
          <SidebarHeader className="p-4 border-b-2 border-black">
            <Link href={`/app/${product}`} className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">Soko-OS</span>
              <span className="text-sm font-bold text-muted-foreground">{productConfig!.name}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {productNavigation.map((group) => (
                <div key={group.title} className="mb-4">
                  <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = iconMap[item.icon as string] || (() => null);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
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
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {productConfig!.name}
              </h1>
              <p className="text-muted-foreground font-bold">{productConfig!.description}</p>
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}