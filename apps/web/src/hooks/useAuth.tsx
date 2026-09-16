'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { SokoApiClient } from '@soko/api-client';
import type { User, Organization, SubscriptionSummary, ProductEntitlement } from '@soko/domain-types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  organization: Organization | null;
  business: { id: string; name: string } | null;
  subscription: SubscriptionSummary | null;
  entitlements: Record<string, boolean>;
  memberships: Array<{
    organization_id: string;
    organization_name: string;
    role_slug: string;
    status: string;
  }>;
  login: (email: string, password: string, deviceUuid?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchTenant: (organizationId: string) => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID || 'pos-device-1';
const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID || 'branch-1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [business, setBusiness] = useState<{ id: string; name: string } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [entitlements, setEntitlements] = useState<Record<string, boolean>>({});
  const [memberships, setMemberships] = useState<AuthContextType['memberships']>([]);

  const apiClient = useMemo(() => new SokoApiClient({
    baseUrl: API_BASE_URL,
    getToken: () => token,
    getDeviceId: () => DEVICE_ID,
  }), [token]);

  const parseAuthMeResponse = useCallback((data: Record<string, unknown>) => {
    const userData = (data.user || data) as Record<string, unknown>;
    setUser(userData as unknown as User);
    setOrganization((userData.organization || null) as Organization | null);
    setBusiness((userData.business || null) as { id: string; name: string } | null);
    setSubscription((userData.subscription || null) as SubscriptionSummary | null);
    
    const entitlementProducts = ((userData.entitlements as Record<string, unknown>)?.products || {}) as Record<string, boolean>;
    setEntitlements(entitlementProducts);
    setMemberships((userData.memberships || []) as AuthContextType['memberships']);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await apiClient.me();
      parseAuthMeResponse(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      setToken(null);
      setOrganization(null);
      setBusiness(null);
      setSubscription(null);
      setEntitlements({});
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, apiClient, parseAuthMeResponse]);

  const login = useCallback(async (email: string, password: string, deviceUuid?: string) => {
    const response = await apiClient.login({ email, password, device_uuid: deviceUuid });
    setToken(response.data.token);
    parseAuthMeResponse(response.data.user as Record<string, unknown>);
  }, [apiClient, parseAuthMeResponse]);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setToken(null);
    setUser(null);
    setOrganization(null);
    setBusiness(null);
    setSubscription(null);
    setEntitlements({});
    setMemberships([]);
  }, [apiClient]);

  const switchTenant = useCallback(async (organizationId: string) => {
    const response = await apiClient.switchTenant({ organization_id: organizationId });
    parseAuthMeResponse(response.data.user);
  }, [apiClient, parseAuthMeResponse]);

  const isSuperAdmin = useMemo(() => user?.is_super_admin || false, [user]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('soko_token');
    if (savedToken) {
      setToken(savedToken);
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Persist token to localStorage and cookie
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (token) {
      localStorage.setItem('soko_token', token);
      document.cookie = `soko_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      localStorage.removeItem('soko_token');
      document.cookie = 'soko_token=; path=/; max-age=0; SameSite=Lax';
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      organization,
      business,
      subscription,
      entitlements,
      memberships,
      login,
      logout,
      refreshUser,
      switchTenant,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
