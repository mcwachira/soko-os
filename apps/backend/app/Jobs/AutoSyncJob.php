<?php

namespace App\Jobs;

use App\Models\Device;
use App\Models\Product;
use App\Models\SyncOperation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AutoSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [30, 60, 120];

    public $timeout = 60;

    public function __construct(
        public string $deviceId
    ) {}

    public function handle(): void
    {
        $device = Device::where('device_uuid', $this->deviceId)->first();

        if (! $device) {
            Log::warning('AutoSyncJob: Device not found', ['device_id' => $this->deviceId]);

            return;
        }

        if ($device->status !== 'approved') {
            Log::info('AutoSyncJob: Device not approved, skipping', [
                'device_id' => $this->deviceId,
                'status' => $device->status,
            ]);

            return;
        }

        $organizationId = $device->organization_id;
        $branchId = $device->branch_id;
        $lastSyncAt = $device->last_sync_at ? $device->last_sync_at->timestamp : 0;

        // Get pending sync operations for this device
        $pendingOps = SyncOperation::where('organization_id', $organizationId)
            ->where('branch_id', $branchId)
            ->where('device_id', $this->deviceId)
            ->whereIn('status', ['pending', 'rejected', 'conflict'])
            ->orderBy('created_at')
            ->limit(100)
            ->get();

        if ($pendingOps->isEmpty()) {
            Log::info('AutoSyncJob: No pending operations', ['device_id' => $this->deviceId]);

            return;
        }

        $synced = 0;
        $failed = 0;

        foreach ($pendingOps as $op) {
            try {
                // For rejected operations, we could retry
                if ($op->status === 'rejected') {
                    $op->update(['status' => 'pending', 'error_message' => null]);
                }

                // For conflicts, we apply server-wins by default
                if ($op->status === 'conflict') {
                    // Apply server-wins resolution
                    $this->applyServerWinsResolution($op);
                }

                $synced++;
            } catch (\Throwable $e) {
                Log::error('AutoSyncJob: Failed to sync operation', [
                    'operation_id' => $op->id,
                    'device_id' => $this->deviceId,
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        $device->update(['last_sync_at' => now()]);

        Log::info('AutoSyncJob: Sync completed', [
            'device_id' => $this->deviceId,
            'synced' => $synced,
            'failed' => $failed,
            'last_sync_at' => now()->toIso8601String(),
        ]);
    }

    private function applyServerWinsResolution(SyncOperation $op): void
    {
        // For products, keep server version
        if ($op->entity_name === 'products') {
            $product = Product::where('id', $op->local_id)
                ->where('organization_id', $op->organization_id)
                ->first();

            if ($product) {
                // Increment version to indicate resolution
                $product->increment('version');
            }
        }

        $op->update(['status' => 'accepted']);
    }
}
