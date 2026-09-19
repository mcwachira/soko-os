'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function CommerceLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="commerce">{children}</ProductLayout>;
}
