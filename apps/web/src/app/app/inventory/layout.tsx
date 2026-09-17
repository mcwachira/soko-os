'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="inventory">{children}</ProductLayout>;
}
