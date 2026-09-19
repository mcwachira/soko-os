<?php

namespace App\Jobs;

use App\Models\RecurringInvoice;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProcessRecurringInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = Carbon::today();

        $recurring = RecurringInvoice::where('is_active', true)
            ->whereDate('next_run_date', '<=', $today)
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $today);
            })
            ->get();

        foreach ($recurring as $recurringInvoice) {
            DB::transaction(function () use ($recurringInvoice, $today) {
                $invoice = Invoice::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $recurringInvoice->organization_id,
                    'business_id' => $recurringInvoice->business_id,
                    'customer_id' => $recurringInvoice->customer_id,
                    'invoice_number' => 'INV-'.strtoupper(Str::random(8)),
                    'status' => 'draft',
                    'issue_date' => $today->toDateString(),
                    'due_date' => $today->addDays(30)->toDateString(),
                    'currency' => $recurringInvoice->currency,
                    'exchange_rate' => $recurringInvoice->exchange_rate,
                    'subtotal_minor' => 0,
                    'discount_minor' => 0,
                    'tax_total_minor' => 0,
                    'grand_total_minor' => 0,
                    'paid_total_minor' => 0,
                    'balance_minor' => 0,
                    'notes' => $recurringInvoice->notes,
                    'terms' => $recurringInvoice->terms,
                ]);

                if ($recurringInvoice->items) {
                    foreach ($recurringInvoice->items as $item) {
                        \App\Models\InvoiceItem::create([
                            'id' => Str::uuid()->toString(),
                            'invoice_id' => $invoice->id,
                            'description' => $item['description'] ?? 'Recurring item',
                            'quantity' => $item['quantity'] ?? 1,
                            'unit_price_minor' => $item['unit_price_minor'] ?? 0,
                            'discount_minor' => $item['discount_minor'] ?? 0,
                            'tax_rate_percentage' => $item['tax_rate_percentage'] ?? 0,
                        ]);
                    }
                }

                $nextRun = match ($recurringInvoice->frequency) {
                    'weekly' => $today->addWeek(),
                    'monthly' => $today->addMonth(),
                    'quarterly' => $today->addMonths(3),
                    'yearly' => $today->addYear(),
                    default => $today->addMonth(),
                };

                $recurringInvoice->update([
                    'next_run_date' => $nextRun->toDateString(),
                ]);
            });
        }
    }
}
