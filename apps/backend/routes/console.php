<?php

use App\Jobs\AutoSyncJob;
use App\Jobs\FiscalizeSaleJob;
use App\Jobs\ProcessOutboxEventsJob;
use App\Models\Device;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule outbox event processing every minute
Schedule::job(new ProcessOutboxEventsJob)->everyMinute();

// Schedule KRA fiscalization retries — dispatches a job per pending submission
Schedule::call(function () {
    \App\Models\TaxSubmission::where('status', 'pending')
        ->where('country_code', 'KE')
        ->limit(10)
        ->each(function ($submission) {
            \App\Jobs\FiscalizeSaleJob::dispatch((string) $submission->sale_id);
        });
})->everyFiveMinutes();

// Schedule auto-sync for online devices every 5 minutes
Schedule::call(function () {
    $devices = Device::where('status', 'approved')
        ->whereNotNull('last_seen_at')
        ->where('last_seen_at', '>', now()->subMinutes(10))
        ->where(function ($query) {
            $query->whereNull('last_sync_at')
                ->orWhere('last_sync_at', '<', now()->subMinutes(5));
        })
        ->get();

    foreach ($devices as $device) {
        AutoSyncJob::dispatch($device->device_uuid);
    }
})->everyFiveMinutes();

// Clean up old outbox events weekly (keep 30 days)
Schedule::command('outbox:cleanup')->weekly();
