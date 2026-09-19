'use client';

import { useState, useCallback, useEffect } from 'react';
import { db } from '@soko/offline';
import type { Product } from '@soko/domain-types';
import type { LocalCart } from '@soko/offline';

// Local cart item with full product object for UI
export interface CartItem {
  product: Product;
  quantity: number;
  discount_minor: number;
}

const CART_STORAGE_KEY = 'soko_pos_cart';
const CART_DB_ID = 'current_cart';

export function useCartPersistence() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      // First try IndexedDB
      const savedCart = await db.carts.get(CART_DB_ID);
      if (savedCart?.items) {
        // The saved items are stored as local CartItem with product objects
        setCart(savedCart.items as unknown as CartItem[]);
        setIsLoading(false);
        return;
      }

      // Fallback to localStorage
      const localStorageCart = localStorage.getItem(CART_STORAGE_KEY);
      if (localStorageCart) {
        const parsed = JSON.parse(localStorageCart);
        setCart(parsed);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCart = useCallback(async (newCart: CartItem[]) => {
    setCart(newCart);
    
    try {
      // Save to IndexedDB
      const localCart: LocalCart = {
        id: CART_DB_ID,
        items: newCart as any,
        discount_minor: newCart.reduce((sum, item) => sum + item.discount_minor, 0),
        updated_at: new Date().toISOString(),
      };
      await db.carts.put(localCart);

      // Also save to localStorage as backup
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, discount_minor = 0) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newCart: CartItem[];
      
      if (existing) {
        newCart = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, { product, quantity, discount_minor }];
      }
      
      saveCart(newCart);
      return newCart;
    });
  }, [saveCart]);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      const newCart = prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0);
      
      saveCart(newCart);
      return newCart;
    });
  }, [saveCart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      saveCart(newCart);
      return newCart;
    });
  }, [saveCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, [saveCart]);

  return {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
