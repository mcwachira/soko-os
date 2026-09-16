'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function useRequireAuth() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, isLoading, router]);

  return { user, isLoading };
}

export function useRequireProduct(productKey: string) {
  const { entitlements, isLoading } = useAuth();
  const router = useRouter();

  const hasAccess = !!entitlements[productKey.toLowerCase()];

  useEffect(() => {
    if (isLoading) return;
    if (!hasAccess) {
      router.push('/unauthorized');
    }
  }, [hasAccess, isLoading, router]);

  return { hasAccess, isLoading };
}

export function useIsSuperAdmin() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin;
}
