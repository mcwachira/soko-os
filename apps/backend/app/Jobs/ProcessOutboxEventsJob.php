<?php

namespace App\Jobs;

use App\Services\OutboxService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOutboxEventsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;

    public $timeout = 60;

    public function handle(): void
    {
        $processed = OutboxService::process(50);

        if ($processed > 0) {
            Log::info('Outbox events processed', [
                'count' => $processed,
            ]);
        }
    }
}
