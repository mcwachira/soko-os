'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="insights">{children}</ProductLayout>;
}
