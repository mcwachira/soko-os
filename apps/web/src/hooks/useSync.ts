import { useState, useEffect, useCallback, useRef } from 'react';
import { SokoApiClient } from '@soko/api-client';
import { db } from '@soko/offline';
import { SyncPushPayload, SyncPushResponse, SyncPullPayload, SyncPullResponse } from '@soko/domain-types';

export interface SyncEngineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  lastError: string | null;
  pendingCount: number;
}

export interface SyncConfig {
  deviceId: string;
  branchId: string;
  apiBaseUrl: string;
  getToken: () => string | null;
  onSyncComplete?: (result: { pushed: number; pulled: boolean }) => void;
  onConflict?: (conflicts: SyncPushResponse['conflicts']) => void;
  onError?: (error: Error) => void;
}

export function useSync(config: SyncConfig) {
  const [state, setState] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncAt: null as Date | null,
    lastError: null as string | null,
    pendingCount: 0,
  });

  const apiClientRef = useRef<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(true);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    apiClientRef.current = new (require('@soko/api-client').SokoApiClient)({
      baseUrl: config.apiBaseUrl,
      getToken: config.getToken,
      getDeviceId: () => config.deviceId,
    });
  }, [config.apiBaseUrl, config.getToken, config.deviceId]);

  useEffect(() => {
    isOnlineRef.current = state.isOnline;
    if (state.isOnline && !state.isSyncing) {
      syncIntervalRef.current = setInterval(() => {
        if (!isSyncingRef.current && isOnlineRef.current) {
          sync();
        }
      }, 30000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [state.isOnline, state.isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      sync();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await db.sync_operations.count();
      setState(prev => ({ ...prev, pendingCount: count }));
    } catch (error) {
      console.error('Failed to count pending operations:', error);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  const getPendingOperations = useCallback(async () => {
    return await db.sync_operations.toArray();
  }, []);

  const markOperationsAccepted = useCallback(async (accepted: any[]) => {
    const ids = accepted.map(a => a.local_id);
    await db.sync_operations.bulkDelete(ids);
    await updatePendingCount();
  }, [updatePendingCount]);

  const markOperationsRejected = useCallback(async (rejected: any[]) => {
    await updatePendingCount();
  }, [updatePendingCount]);

  const handleConflicts = useCallback(async (conflicts: any[]) => {
    if (conflicts.length > 0 && config.onConflict) {
      config.onConflict(conflicts);
    }
  }, [config]);

  const applyPullChanges = useCallback(async (changes: any) => {
    if (changes?.products) {
      for (const product of changes.products) {
        await db.products.put({ ...product, sync_status: 'synced' });
      }
    }
    if (changes?.categories) {
      for (const category of changes.categories) {
        await db.categories.put(category);
      }
    }
    if (changes?.customers) {
      for (const customer of changes.customers) {
        await db.customers.put({ ...customer, sync_status: 'synced' });
      }
    }
  }, []);

  const getCursor = useCallback(async (): Promise<string> => {
    const meta = await db.sync_metadata.get('last_cursor');
    return meta?.value || '0';
  }, []);

  const saveCursor = useCallback(async (cursor: string) => {
    await db.sync_metadata.put({ key: 'last_cursor', value: cursor, updated_at: new Date().toISOString() });
  }, []);

  const sync = useCallback(async (): Promise<{ pushed: number; pulled: boolean }> => {
    if (isSyncingRef.current || !isOnlineRef.current) {
      return { pushed: 0, pulled: false };
    }

    if (!apiClientRef.current) {
      return { pushed: 0, pulled: false };
    }

    isSyncingRef.current = true;
    setState(prev => ({ ...prev, isSyncing: true, lastError: null }));
    retryCountRef.current = 0;

    try {
      const operations = await getPendingOperations();
      let pushedCount = 0;

      if (operations.length > 0) {
        const cursor = await getCursor();
        const payload = {
          device_id: config.deviceId,
          branch_id: config.branchId,
          cursor,
          operations: operations.map(op => ({
            operation_id: op.operation_id,
            idempotency_key: op.idempotency_key,
            entity_name: op.entity_name,
            action: op.action,
            local_id: op.local_id,
            data: op.data,
            created_at: op.created_at,
          })),
        };

        const response = await apiClientRef.current.pushSync(payload);

        if (response.accepted.length > 0) {
          await markOperationsAccepted(response.accepted);
          pushedCount = response.accepted.length;
        }

        if (response.rejected.length > 0) {
          await markOperationsRejected(response.rejected);
        }

        if (response.conflicts.length > 0) {
          await handleConflicts(response.conflicts);
        }

        if (response.cursor) {
          await saveCursor(response.cursor);
        }
      }

      const currentCursor = await getCursor();
      const pullResponse = await apiClientRef.current.pullSync({
        device_id: config.deviceId,
        branch_id: config.branchId,
        since_cursor: currentCursor,
      } as SyncPullPayload);

      if (pullResponse.changes) {
        await applyPullChanges(pullResponse.changes);
      }

      if (pullResponse.next_cursor) {
        await saveCursor(pullResponse.next_cursor);
      }

      const result = { pushed: pushedCount, pulled: true };

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncAt: new Date(),
          lastError: null,
        }));
      }

      if (config.onSyncComplete) {
        config.onSyncComplete(result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      retryCountRef.current += 1;

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastError: errorMessage,
        }));
      }

      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error(errorMessage));
      }

      throw error;
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    getPendingOperations,
    getCursor,
    markOperationsAccepted,
    markOperationsRejected,
    handleConflicts,
    applyPullChanges,
    config,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    sync,
    updatePendingCount,
  };
}
