<?php

namespace App\Jobs;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateInvoicePdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected Invoice $invoice)
    {
    }

    public function handle(): void
    {
        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $this->invoice->load('items', 'customer')]);
        $path = "invoices/{$this->invoice->id}.pdf";
        Storage::disk('local')->put($path, $pdf->output());
    }
}
