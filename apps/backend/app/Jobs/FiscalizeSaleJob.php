<?php

namespace App\Jobs;

use App\Models\Sale;
use App\Services\Tax\KraEtimsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FiscalizeSaleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [60, 300, 900]; // 1min, 5min, 15min

    public $timeout = 120;

    public function __construct(
        public string $saleId
    ) {}

    public function handle(KraEtimsService $kraService): void
    {
        $sale = Sale::with(['items', 'payments'])->find($this->saleId);

        if (! $sale) {
            Log::warning('FiscalizeSaleJob: Sale not found', ['sale_id' => $this->saleId]);

            return;
        }

        // Skip if already submitted
        if (in_array($sale->tax_submission_status, ['submitted', 'accepted'])) {
            Log::info('FiscalizeSaleJob: Sale already submitted to KRA', ['sale_id' => $this->saleId]);

            return;
        }

        try {
            $submission = $kraService->fiscalizeSale($sale);

            // Update sale status
            $sale->update(['tax_submission_status' => $submission->status]);

            Log::info('FiscalizeSaleJob: KRA submission queued', [
                'sale_id' => $this->saleId,
                'submission_id' => $submission->id,
                'status' => $submission->status,
            ]);
        } catch (\Throwable $e) {
            Log::error('FiscalizeSaleJob: Failed to queue KRA submission', [
                'sale_id' => $this->saleId,
                'error' => $e->getMessage(),
            ]);

            // Update sale with error status
            $sale->update(['tax_submission_status' => 'failed']);

            throw $e; // Trigger retry
        }
    }
}
