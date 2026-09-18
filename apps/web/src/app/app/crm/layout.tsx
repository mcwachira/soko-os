'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="crm">{children}</ProductLayout>;
}
