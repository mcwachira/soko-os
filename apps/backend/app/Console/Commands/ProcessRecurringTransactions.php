<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\ProcessRecurringInvoices;
use App\Jobs\ProcessRecurringBills;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'recurring:process';
    protected $description = 'Process recurring invoices and bills';

    public function handle(): void
    {
        ProcessRecurringInvoices::dispatch();
        ProcessRecurringBills::dispatch();

        $this->info('Recurring transactions processed.');
    }
}
