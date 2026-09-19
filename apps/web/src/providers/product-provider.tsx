'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PRODUCT_CONFIGS, PRODUCT_KEYS, PRODUCT_THEMES, ProductKey, getProductConfig } from '@/config/product-config';

interface ProductContextType {
  currentProduct: ProductKey | null;
  setProduct: (product: ProductKey) => void;
  availableProducts: ProductKey[];
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
  defaultProduct?: ProductKey;
}

export function ProductProvider({ children, defaultProduct = 'pos' }: ProductProviderProps) {
  const [currentProduct, setCurrentProduct] = useState<ProductKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      const savedProduct = localStorage.getItem('soko-current-product') as ProductKey | null;
      if (savedProduct && PRODUCT_KEYS.includes(savedProduct)) {
        setCurrentProduct(savedProduct);
      } else {
        setCurrentProduct(defaultProduct);
      }
    }
    setIsLoading(false);
  }, [defaultProduct]);

  const setProduct = (product: ProductKey) => {
    setCurrentProduct(product);
    if (typeof window !== 'undefined') {
      localStorage.setItem('soko-current-product', product);
    }
  };

  const availableProducts = PRODUCT_KEYS;

  return (
    <ProductContext.Provider value={{ currentProduct, setProduct, availableProducts, isLoading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

export function getProductThemeVariables(product: ProductKey): Record<string, string> {
  const theme = PRODUCT_THEMES[product];
  return {
    '--main': theme.main,
    '--main-foreground': theme.mainForeground,
    '--background': theme.background,
    '--secondary-background': theme.secondaryBackground,
    '--foreground': theme.foreground,
    '--border': theme.border,
    '--ring': theme.ring,
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--secondary': theme.secondary,
    '--secondary-foreground': theme.secondaryForeground,
    '--accent': theme.accent,
    '--accent-foreground': theme.accentForeground,
    '--muted': theme.muted,
    '--muted-foreground': theme.mutedForeground,
    '--card': theme.card,
    '--card-foreground': theme.cardForeground,
    '--popover': theme.popover,
    '--popover-foreground': theme.popoverForeground,
    '--input': theme.input,
    '--sidebar-background': theme.sidebarBackground,
    '--sidebar-foreground': theme.sidebarForeground,
    '--sidebar-primary': theme.sidebarPrimary,
    '--sidebar-primary-foreground': theme.sidebarPrimaryForeground,
    '--sidebar-accent': theme.sidebarAccent,
    '--sidebar-accent-foreground': theme.sidebarAccentForeground,
    '--sidebar-border': theme.sidebarBorder,
    '--sidebar-ring': theme.sidebarRing,
  };
}