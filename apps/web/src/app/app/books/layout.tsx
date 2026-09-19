'use client';

import { ProductLayout } from '@/components/layout/ProductLayout';

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout product="books">{children}</ProductLayout>;
}
