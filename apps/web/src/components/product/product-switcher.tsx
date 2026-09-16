'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProduct } from '@/providers/product-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ShoppingCart,
  Handshake,
  BookOpen,
  Package,
  ShoppingBag,
  BarChart3,
  ShoppingCart as CommerceIcon,
  Check,
  LayoutDashboard,
} from 'lucide-react';
import { PRODUCT_CONFIGS, ProductKey } from '@/config/product-config';

export function ProductSwitcher() {
  const { entitlements, isSuperAdmin } = useAuth();
  const { currentProduct, setProduct, availableProducts, isLoading } = useProduct();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="border-2 border-black">
        <LayoutDashboard className="h-4 w-4" />
      </Button>
    );
  }

  const availableProductKeys = availableProducts.filter((key) =>
    isSuperAdmin || entitlements[key]
  );

  if (availableProductKeys.length === 0) {
    return (
      <Button variant="ghost" size="icon" className="border-2 border-black" disabled>
        <LayoutDashboard className="h-4 w-4" />
      </Button>
    );
  }

  const productIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pos: ShoppingCart,
    crm: Handshake,
    books: BookOpen,
    inventory: Package,
    procurement: ShoppingBag,
    commerce: CommerceIcon,
    insights: BarChart3,
  };

  const CurrentProductIcon = currentProduct ? productIcons[currentProduct] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="border-2 border-black relative"
        >
          {CurrentProductIcon && <CurrentProductIcon className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-2 border-black min-w-[200px]">
        <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Switch Product
        </div>
        {availableProductKeys.map((key) => {
          const config = PRODUCT_CONFIGS[key];
          const isCurrent = currentProduct === key;
          const Icon = productIcons[key];
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => setProduct(key as ProductKey)}
              className={`font-bold flex items-center gap-2 ${isCurrent ? 'bg-main/10' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span>{config.name}</span>
              {isCurrent && <Check className="h-4 w-4 ml-auto text-main" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}