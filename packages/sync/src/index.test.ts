import { describe, it, expect, vi } from 'vitest';
import { OfflineSyncEngine } from './index';
import { SyncPushResponse, SyncPullResponse } from '@soko/domain-types';

describe('@soko/sync', () => {
  it('pushes pending local operations and pulls changes from server', async () => {
    const mockPendingOps = [
      {
        operation_id: 'op-1',
        idempotency_key: 'idem-1',
        entity_type: 'sales',
        entity_id: 'sale-1',
        action: 'create' as const,
        payload: { id: 'sale-1', total: 1000 },
        created_at: new Date().toISOString(),
      },
    ];

    const mockPushResponse: SyncPushResponse = {
      accepted: [{ operation_id: 'op-1', local_id: 'sale-1', server_id: 'srv-sale-1' }],
      rejected: [],
      conflicts: [],
      cursor: 'cursor-after-push',
    };

    const mockPullResponse: SyncPullResponse = {
      changes: {
        products: [],
        categories: [],
        customers: [],
        tax_rules: [],
      },
      next_cursor: 'cursor-after-pull',
      has_more: false,
    };

    const apiClient = {
      push: vi.fn().mockResolvedValue(mockPushResponse),
      pull: vi.fn().mockResolvedValue(mockPullResponse),
    };

    let cursor = 'cursor-initial';
    const storage = {
      getPendingOperations: vi.fn().mockResolvedValue(mockPendingOps),
      markOperationsAccepted: vi.fn().mockResolvedValue(undefined),
      markOperationsRejected: vi.fn().mockResolvedValue(undefined),
      handleConflicts: vi.fn().mockResolvedValue(undefined),
      applyPullChanges: vi.fn().mockResolvedValue(undefined),
      getCursor: vi.fn().mockImplementation(async () => cursor),
      saveCursor: vi.fn().mockImplementation(async (c: string) => {
        cursor = c;
      }),
    };

    const engine = new OfflineSyncEngine(
      apiClient,
      storage,
      { deviceId: 'dev-1', branchId: 'br-1' }
    );

    const result = await engine.sync();

    expect(result.pushed).toBe(1);
    expect(result.pulled).toBe(true);
    expect(apiClient.push).toHaveBeenCalledTimes(1);
    expect(storage.markOperationsAccepted).toHaveBeenCalledWith(mockPushResponse.accepted);
    expect(apiClient.pull).toHaveBeenCalledTimes(1);
    expect(cursor).toBe('cursor-after-pull');
  });
});
