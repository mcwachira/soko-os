'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="procurement">{children}</ProductLayout>;
}
