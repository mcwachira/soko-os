'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="pos">{children}</ProductLayout>;
}
