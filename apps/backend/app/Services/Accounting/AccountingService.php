<?php

namespace App\Services\Accounting;

use App\Models\Account;
use App\Models\Customer;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Product;
use App\Models\Sale;
use App\Services\OutboxService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AccountingService
{
    protected AccountingProvider $provider;

    protected string $providerName;

    public function __construct(?AccountingProvider $provider = null)
    {
        $this->provider = $provider ?? new ZohoBooksAdapter;
        $this->providerName = $this->provider->getName();
    }

    public function setProvider(AccountingProvider $provider): void
    {
        $this->provider = $provider;
        $this->providerName = $provider->getName();
    }

    public function getProviderName(): string
    {
        return $this->providerName;
    }

    public function isConnected(): bool
    {
        return $this->provider->isConnected();
    }

    public function connect(array $config): bool
    {
        return $this->provider->connect($config);
    }

    public function syncChartOfAccounts(): array
    {
        return $this->provider->syncChartOfAccounts();
    }

    public function syncCustomer(Customer $customer): ?string
    {
        if (! $this->isConnected()) {
            Log::warning('Accounting sync customer skipped: not connected', [
                'provider' => $this->providerName,
                'customer_id' => $customer->id,
            ]);

            return null;
        }

        try {
            $externalId = $customer->getAccountingId($this->providerName);

            $data = [
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'tax_pin' => $customer->tax_pin,
                'address' => null,
                'city' => null,
                'state' => null,
                'postal_code' => null,
                'country' => 'Kenya',
            ];

            if ($externalId) {
                $this->provider->updateCustomer($externalId, $data);

                return $externalId;
            } else {
                $externalId = $this->provider->createCustomer($data);
                $customer->setAccountingId($this->providerName, $externalId);

                return $externalId;
            }
        } catch (\Throwable $e) {
            Log::error('Accounting sync customer failed', [
                'provider' => $this->providerName,
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function syncProduct(Product $product): ?string
    {
        if (! $this->isConnected()) {
            Log::warning('Accounting sync product skipped: not connected', [
                'provider' => $this->providerName,
                'product_id' => $product->id,
            ]);

            return null;
        }

        try {
            $externalId = $product->getAccountingId($this->providerName);

            $data = [
                'name' => $product->name,
                'description' => $product->description,
                'selling_price_minor' => $product->selling_price_minor,
                'cost_price_minor' => $product->cost_price_minor,
                'unit' => $product->unit,
                'sku' => $product->sku,
                'tax_id' => null,
            ];

            if ($externalId) {
                $this->provider->updateProduct($externalId, $data);

                return $externalId;
            } else {
                $externalId = $this->provider->createProduct($data);
                $product->setAccountingId($this->providerName, $externalId);

                return $externalId;
            }
        } catch (\Throwable $e) {
            Log::error('Accounting sync product failed', [
                'provider' => $this->providerName,
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function createSaleInvoice(Sale $sale): ?string
    {
        if (! $this->isConnected()) {
            Log::warning('Accounting create invoice skipped: not connected', [
                'provider' => $this->providerName,
                'sale_id' => $sale->id,
            ]);

            return null;
        }

        try {
            $customerId = null;
            if ($sale->customer) {
                $customerId = $this->syncCustomer($sale->customer);
            }

            $lineItems = [];
            foreach ($sale->items as $item) {
                $productId = null;
                if ($item->product) {
                    $productId = $this->syncProduct($item->product);
                }

                $lineItems[] = [
                    'item_id' => $productId,
                    'name' => $item->name,
                    'description' => null,
                    'rate' => $item->unit_price_minor / 100,
                    'quantity' => (float) $item->quantity,
                    'discount' => $item->discount_minor / 100,
                    'tax_code' => $item->tax_rate_percentage > 0 ? 'OUTPUT' : 'EXEMPT',
                    'account_code' => '200',
                ];
            }

            $data = [
                'customer_id' => $customerId,
                'date' => $sale->created_at->format('Y-m-d'),
                'due_date' => $sale->created_at->addDays(30)->format('Y-m-d'),
                'line_items' => $lineItems,
                'reference_number' => $sale->invoice_number ?? $sale->receipt_number,
                'notes' => $sale->notes,
            ];

            $invoiceId = $this->provider->createInvoice($data);

            // Record in outbox for tracking
            OutboxService::record('accounting.invoice_created', [
                'sale_id' => $sale->id,
                'invoice_id' => $invoiceId,
                'provider' => $this->providerName,
            ], $sale->organization_id);

            return $invoiceId;
        } catch (\Throwable $e) {
            Log::error('Accounting create sale invoice failed', [
                'provider' => $this->providerName,
                'sale_id' => $sale->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function createReturnCreditNote(ReturnModel $return): ?string
    {
        if (! $this->isConnected()) {
            Log::warning('Accounting create credit note skipped: not connected', [
                'provider' => $this->providerName,
                'return_id' => $return->id,
            ]);

            return null;
        }

        try {
            $customerId = null;
            if ($return->sale->customer) {
                $customerId = $this->syncCustomer($return->sale->customer);
            }

            $lineItems = [];
            foreach ($return->items as $item) {
                $productId = null;
                if ($item->product) {
                    $productId = $this->syncProduct($item->product);
                }

                $lineItems[] = [
                    'item_id' => $productId,
                    'name' => $item->name,
                    'description' => null,
                    'rate' => $item->unit_price_minor / 100,
                    'quantity' => (float) $item->quantity,
                    'tax_code' => $item->tax_rate_percentage > 0 ? 'OUTPUT' : 'EXEMPT',
                    'account_code' => '200',
                ];
            }

            $data = [
                'customer_id' => $customerId,
                'date' => $return->created_at->format('Y-m-d'),
                'line_items' => $lineItems,
                'reference_number' => $return->return_number,
                'reason' => $return->reason ?? 'Return/Refund',
            ];

            $creditNoteId = $this->provider->createCreditNote($data);

            OutboxService::record('accounting.credit_note_created', [
                'return_id' => $return->id,
                'credit_note_id' => $creditNoteId,
                'provider' => $this->providerName,
            ], $return->organization_id);

            return $creditNoteId;
        } catch (\Throwable $e) {
            Log::error('Accounting create return credit note failed', [
                'provider' => $this->providerName,
                'return_id' => $return->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function createPaymentRecord($payment, string $type = 'sale'): ?string
    {
        if (! $this->isConnected()) {
            Log::warning('Accounting create payment skipped: not connected', [
                'provider' => $this->providerName,
                'payment_id' => $payment->id,
            ]);

            return null;
        }

        try {
            $customerId = null;
            $invoiceId = null;
            $amountMinor = $payment->amount_minor;

            if ($type === 'sale' && $payment->sale) {
                $sale = $payment->sale;
                if ($sale->customer) {
                    $customerId = $this->syncCustomer($sale->customer);
                }
                $invoiceId = $sale->getAccountingInvoiceId($this->providerName);
            } elseif ($type === 'refund' && $payment->refund) {
                $refund = $payment->refund;
                if ($refund->customer) {
                    $customerId = $this->syncCustomer($refund->customer);
                }
                $invoiceId = $refund->getAccountingCreditNoteId($this->providerName);
            }

            $data = [
                'customer_id' => $customerId,
                'payment_method' => $payment->payment_method,
                'amount_minor' => $amountMinor,
                'date' => now()->format('Y-m-d'),
                'reference' => $payment->reference ?? $payment->external_transaction_id,
                'description' => 'Payment for '.($invoiceId ?? $payment->id),
                'invoices' => $invoiceId ? ['invoice_id' => $invoiceId, 'amount' => $amountMinor / 100] : [],
            ];

            $paymentId = $this->provider->createPayment($data);

            OutboxService::record('accounting.payment_created', [
                'payment_id' => $payment->id,
                'accounting_payment_id' => $paymentId,
                'provider' => $this->providerName,
            ], $payment->organization_id ?? $payment->sale?->organization_id ?? $payment->refund?->organization_id);

            return $paymentId;
        } catch (\Throwable $e) {
            Log::error('Accounting create payment failed', [
                'provider' => $this->providerName,
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function generateJournalEntry(Sale $sale): ?JournalEntry
    {
        // Generate local journal entry for the sale
        return DB::transaction(function () use ($sale) {
            $journalEntry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $sale->organization_id,
                'business_id' => $sale->business_id,
                'reference_type' => 'sale',
                'reference_id' => $sale->id,
                'entry_date' => $sale->created_at->toDateString(),
                'notes' => 'Sale '.$sale->receipt_number,
            ]);

            // Get default accounts
            $accounts = Account::where('organization_id', $sale->organization_id)
                ->where('business_id', $sale->business_id)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $arAccount = $accounts['1200'] ?? $accounts->where('type', 'asset')->first(); // Accounts Receivable
            $salesAccount = $accounts['4000'] ?? $accounts->where('type', 'revenue')->first(); // Sales Revenue
            $taxAccount = $accounts['2200'] ?? $accounts->where('type', 'liability')->first(); // Tax Payable
            $cashAccount = $accounts['1000'] ?? $accounts->where('type', 'asset')->first(); // Cash/Bank
            $cogsAccount = $accounts['5000'] ?? $accounts->where('type', 'expense')->first(); // COGS
            $inventoryAccount = $accounts['1300'] ?? $accounts->where('type', 'asset')->first(); // Inventory

            if (! $arAccount || ! $salesAccount || ! $cashAccount) {
                Log::warning('Missing required accounts for journal entry', [
                    'sale_id' => $sale->id,
                    'has_ar' => (bool) $arAccount,
                    'has_sales' => (bool) $salesAccount,
                    'has_cash' => (bool) $cashAccount,
                ]);

                return null;
            }

            $lines = [];

            // Debit: Accounts Receivable / Cash
            $lines[] = [
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $sale->paid_total_minor > 0 ? $cashAccount->id : $arAccount->id,
                'description' => 'Sale '.$sale->receipt_number.' - '.($sale->paid_total_minor > 0 ? 'Cash' : 'Receivable'),
                'debit_minor' => $sale->grand_total_minor,
                'credit_minor' => 0,
            ];

            // Credit: Sales Revenue
            $lines[] = [
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $salesAccount->id,
                'description' => 'Sale '.$sale->receipt_number.' - Revenue',
                'debit_minor' => 0,
                'credit_minor' => $sale->subtotal_minor,
            ];

            // Credit: Tax Payable
            if ($sale->tax_total_minor > 0 && $taxAccount) {
                $lines[] = [
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $taxAccount->id,
                    'description' => 'Sale '.$sale->receipt_number.' - VAT',
                    'debit_minor' => 0,
                    'credit_minor' => $sale->tax_total_minor,
                ];
            }

            // Credit: Discount (if any)
            if ($sale->discount_minor > 0) {
                $discountAccount = $accounts['4100'] ?? $salesAccount; // Sales Discounts
                $lines[] = [
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $discountAccount->id,
                    'description' => 'Sale '.$sale->receipt_number.' - Discount',
                    'debit_minor' => 0,
                    'credit_minor' => $sale->discount_minor,
                ];
            }

            // Debit: COGS & Credit: Inventory (for each item)
            foreach ($sale->items as $item) {
                if ($cogsAccount && $inventoryAccount) {
                    $cogsAmount = (int) ($item->quantity * $item->product?->cost_price_minor ?? 0);

                    if ($cogsAmount > 0) {
                        $lines[] = [
                            'journal_entry_id' => $journalEntry->id,
                            'account_id' => $cogsAccount->id,
                            'description' => 'Sale '.$sale->receipt_number.' - COGS: '.$item->name,
                            'debit_minor' => $cogsAmount,
                            'credit_minor' => 0,
                        ];

                        $lines[] = [
                            'journal_entry_id' => $journalEntry->id,
                            'account_id' => $inventoryAccount->id,
                            'description' => 'Sale '.$sale->receipt_number.' - Inventory: '.$item->name,
                            'debit_minor' => 0,
                            'credit_minor' => $cogsAmount,
                        ];
                    }
                }
            }

            // Validate balanced
            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Journal entry not balanced', [
                    'sale_id' => $sale->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $journalEntry;
        });
    }
}
