<?php

namespace App\Jobs;

use App\Models\RecurringBill;
use App\Models\Bill;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProcessRecurringBills implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = Carbon::today();

        $recurring = RecurringBill::where('is_active', true)
            ->whereDate('next_run_date', '<=', $today)
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $today);
            })
            ->get();

        foreach ($recurring as $recurringBill) {
            DB::transaction(function () use ($recurringBill, $today) {
                $bill = Bill::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $recurringBill->organization_id,
                    'business_id' => $recurringBill->business_id,
                    'supplier_id' => $recurringBill->supplier_id,
                    'bill_number' => 'BILL-'.strtoupper(Str::random(8)),
                    'status' => 'draft',
                    'issue_date' => $today->toDateString(),
                    'due_date' => $today->addDays(30)->toDateString(),
                    'currency' => $recurringBill->currency,
                    'exchange_rate' => $recurringBill->exchange_rate,
                    'subtotal_minor' => 0,
                    'discount_minor' => 0,
                    'tax_total_minor' => 0,
                    'grand_total_minor' => 0,
                    'paid_total_minor' => 0,
                    'balance_minor' => 0,
                    'notes' => $recurringBill->notes,
                ]);

                if ($recurringBill->items) {
                    foreach ($recurringBill->items as $item) {
                        \App\Models\BillItem::create([
                            'id' => Str::uuid()->toString(),
                            'bill_id' => $bill->id,
                            'description' => $item['description'] ?? 'Recurring item',
                            'quantity' => $item['quantity'] ?? 1,
                            'unit_cost_minor' => $item['unit_cost_minor'] ?? 0,
                            'discount_minor' => $item['discount_minor'] ?? 0,
                            'tax_rate_percentage' => $item['tax_rate_percentage'] ?? 0,
                        ]);
                    }
                }

                $nextRun = match ($recurringBill->frequency) {
                    'weekly' => $today->addWeek(),
                    'monthly' => $today->addMonth(),
                    'quarterly' => $today->addMonths(3),
                    'yearly' => $today->addYear(),
                    default => $today->addMonth(),
                };

                $recurringBill->update([
                    'next_run_date' => $nextRun->toDateString(),
                ]);
            });
        }
    }
}
