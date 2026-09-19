<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Models\PaymentReminder;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Send payment reminders for overdue invoices';

    public function handle(): void
    {
        $today = Carbon::today();

        $overdueInvoices = Invoice::where('organization_id', '!=', '')
            ->whereIn('status', ['sent', 'partially_paid'])
            ->whereDate('due_date', '<', $today)
            ->whereDoesntHave('reminders', function ($query) {
                $query->whereDate('created_at', '>=', Carbon::today()->subDays(3));
            })
            ->get();

        foreach ($overdueInvoices as $invoice) {
            PaymentReminder::create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'organization_id' => $invoice->organization_id,
                'business_id' => $invoice->business_id,
                'reminder_type' => 'overdue',
                'reference_type' => 'invoice',
                'reference_id' => $invoice->id,
                'channel' => 'email',
                'status' => 'pending',
            ]);
        }

        $this->info('Payment reminders queued: '.$overdueInvoices->count());
    }
}
