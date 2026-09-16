import { SyncPushPayload, SyncPushResponse, SyncPullPayload, SyncPullResponse } from '@soko/domain-types';
import { getBackoffDelay } from '@soko/utils';

export interface ISyncEngineClient {
  push(payload: SyncPushPayload): Promise<SyncPushResponse>;
  pull(payload: SyncPullPayload): Promise<SyncPullResponse>;
}

export interface SyncEngineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  lastError: string | null;
  pendingCount: number;
}

export class OfflineSyncEngine {
  private isSyncing = false;
  private currentAttempt = 0;

  constructor(
    private apiClient: ISyncEngineClient,
    private storage: {
      getPendingOperations: () => Promise<SyncPushPayload['operations']>;
      markOperationsAccepted: (accepted: SyncPushResponse['accepted']) => Promise<void>;
      markOperationsRejected: (rejected: SyncPushResponse['rejected']) => Promise<void>;
      handleConflicts: (conflicts: SyncPushResponse['conflicts']) => Promise<void>;
      applyPullChanges: (changes: SyncPullResponse['changes']) => Promise<void>;
      getCursor: () => Promise<string>;
      saveCursor: (cursor: string) => Promise<void>;
    },
    private context: {
      deviceId: string;
      branchId: string;
    }
  ) {}

  async sync(): Promise<{ pushed: number; pulled: boolean }> {
    if (this.isSyncing) {
      return { pushed: 0, pulled: false };
    }

    this.isSyncing = true;
    try {
      // 1. Push pending local operations
      const operations = await this.storage.getPendingOperations();
      let pushedCount = 0;

      if (operations.length > 0) {
        const cursor = await this.storage.getCursor();
        const response = await this.apiClient.push({
          device_id: this.context.deviceId,
          branch_id: this.context.branchId,
          cursor,
          operations,
        });

        if (response.accepted.length > 0) {
          await this.storage.markOperationsAccepted(response.accepted);
          pushedCount = response.accepted.length;
        }

        if (response.rejected.length > 0) {
          await this.storage.markOperationsRejected(response.rejected);
        }

        if (response.conflicts.length > 0) {
          await this.storage.handleConflicts(response.conflicts);
        }

        if (response.cursor) {
          await this.storage.saveCursor(response.cursor);
        }
      }

      // 2. Pull latest server updates
      const currentCursor = await this.storage.getCursor();
      const pullResponse = await this.apiClient.pull({
        device_id: this.context.deviceId,
        branch_id: this.context.branchId,
        since_cursor: currentCursor,
      });

      if (pullResponse.changes) {
        await this.storage.applyPullChanges(pullResponse.changes);
      }

      if (pullResponse.next_cursor) {
        await this.storage.saveCursor(pullResponse.next_cursor);
      }

      this.currentAttempt = 0;
      return { pushed: pushedCount, pulled: true };
    } catch (error) {
      this.currentAttempt++;
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  getNextRetryDelay(): number {
    return getBackoffDelay(this.currentAttempt);
  }
}
