'use client';

import { useSync } from '@/hooks/useSync';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const { isOnline, isSyncing, lastSyncAt, pendingCount, lastError } = useSync({
    deviceId: process.env.NEXT_PUBLIC_DEVICE_ID || 'pos-device-1',
    branchId: process.env.NEXT_PUBLIC_BRANCH_ID || 'branch-1',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    getToken: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('soko_token');
      }
      return null;
    },
  });

  const [showDetails, setShowDetails] = useState(false);

  if (isOnline && !isSyncing && pendingCount === 0 && !lastError) {
    return (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-success" />
        <span className="text-sm font-bold text-success">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 p-2 rounded-lg border-2 border-black bg-background"
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 text-destructive" />
            <span className="text-sm font-bold text-destructive">Offline</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin text-info" />
            <span className="text-sm font-bold text-info">Syncing</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-bold text-warning">{pendingCount} pending</span>
          </>
        ) : lastError ? (
          <>
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-bold text-destructive">Sync Error</span>
          </>
        ) : null}
      </button>
      
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border-2 border-black bg-background p-3 shadow-lg z-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-bold">Status</span>
              <span className={isOnline ? 'text-success' : 'text-destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {isSyncing && (
              <div className="flex justify-between">
                <span className="font-bold">Syncing</span>
                <span className="text-info">Yes</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex justify-between">
                <span className="font-bold">Pending Operations</span>
                <span className="text-warning">{pendingCount}</span>
              </div>
            )}
            {lastSyncAt && (
              <div className="flex justify-between">
                <span className="font-bold">Last Sync</span>
                <span>{new Date(lastSyncAt).toLocaleString()}</span>
              </div>
            )}
            {lastError && (
              <div className="flex justify-between text-destructive">
                <span className="font-bold">Last Error</span>
                <span>{lastError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
