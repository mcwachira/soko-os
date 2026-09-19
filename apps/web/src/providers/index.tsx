'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryProvider } from '@/hooks/useTanStackQuery';
import { ProductProvider } from '@/providers/product-provider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="soko-theme">
      <ProductProvider defaultProduct="pos">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}