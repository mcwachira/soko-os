<?php

namespace App\Services;

use App\Jobs\FiscalizeSaleJob;
use App\Models\OutboxEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OutboxService
{
    /**
     * Store an event in the outbox for reliable delivery.
     */
    public static function record(string $eventName, array $payload, ?string $organizationId = null): OutboxEvent
    {
        return DB::transaction(function () use ($eventName, $payload, $organizationId) {
            return OutboxEvent::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'event_name' => $eventName,
                'payload' => $payload,
                'status' => 'pending',
                'retry_count' => 0,
            ]);
        });
    }

    /**
     * Process pending outbox events.
     *
     * @param  int  $batchSize  Number of events to process in one batch
     * @return int Number of events processed
     */
    public static function process(int $batchSize = 100): int
    {
        $events = OutboxEvent::where('status', 'pending')
            ->where('retry_count', '<', 5)
            ->orderBy('created_at')
            ->limit($batchSize)
            ->get();

        $processed = 0;

        foreach ($events as $event) {
            try {
                $event->update(['status' => 'processing']);

                // Dispatch to appropriate handler based on event name
                self::dispatchEvent($event);

                $event->update([
                    'status' => 'published',
                    'retry_count' => 0,
                ]);

                $processed++;
            } catch (\Throwable $e) {
                Log::error('Outbox event processing failed', [
                    'event_id' => $event->id,
                    'event_name' => $event->event_name,
                    'error' => $e->getMessage(),
                ]);

                $event->update([
                    'status' => 'failed',
                    'retry_count' => $event->retry_count + 1,
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        return $processed;
    }

    /**
     * Dispatch event to appropriate handler.
     */
    private static function dispatchEvent(OutboxEvent $event): void
    {
        switch ($event->event_name) {
            case 'sale.created':
                FiscalizeSaleJob::dispatch($event->payload['sale_id'] ?? '');
                break;
            case 'sale.updated':
                // Handle sale update events
                break;
            case 'customer.created':
                // Handle customer sync to accounting
                break;
            case 'product.updated':
                // Handle product sync to accounting/integrations
                break;
            default:
                Log::warning('Unknown outbox event', [
                    'event_name' => $event->event_name,
                    'event_id' => $event->id,
                ]);
        }
    }

    /**
     * Get failed events that need manual intervention.
     */
    public static function getFailedEvents(int $limit = 50)
    {
        return OutboxEvent::where('status', 'failed')
            ->where('retry_count', '>=', 5)
            ->orderBy('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Retry a failed event.
     */
    public static function retryEvent(string $eventId): bool
    {
        $event = OutboxEvent::find($eventId);
        if (! $event || $event->status !== 'failed') {
            return false;
        }

        $event->update([
            'status' => 'pending',
            'retry_count' => 0,
            'error_message' => null,
        ]);

        return true;
    }
}
