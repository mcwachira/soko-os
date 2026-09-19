<?php

namespace App\Services\Accounting;

use App\Models\Account;
use App\Models\CreditNote;
use App\Models\DebitNote;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class JournalService
{
    public function createDraft(array $data): JournalEntry
    {
        return DB::transaction(function () use ($data) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $data['organization_id'],
                'business_id' => $data['business_id'] ?? null,
                'reference_type' => $data['reference_type'] ?? 'manual',
                'reference_id' => $data['reference_id'] ?? null,
                'entry_date' => $data['entry_date'],
                'notes' => $data['notes'] ?? null,
                'status' => 'draft',
                'entry_type' => $data['entry_type'] ?? 'manual',
            ]);

            $totalDebits = 0;
            $totalCredits = 0;

            foreach ($data['lines'] as $lineData) {
                $line = JournalLine::create([
                    'id' => Str::uuid()->toString(),
                    'journal_entry_id' => $entry->id,
                    'account_id' => $lineData['account_id'],
                    'description' => $lineData['description'] ?? null,
                    'debit_minor' => (int) ($lineData['debit_minor'] ?? 0),
                    'credit_minor' => (int) ($lineData['credit_minor'] ?? 0),
                    'entry_type' => $data['entry_type'] ?? 'manual',
                    'branch_id' => $lineData['branch_id'] ?? null,
                    'external_reference' => $lineData['external_reference'] ?? null,
                ]);

                $totalDebits += $line->debit_minor;
                $totalCredits += $line->credit_minor;
            }

            if ($totalDebits !== $totalCredits) {
                throw new \InvalidArgumentException('Journal entry is not balanced. Total debits: '.$totalDebits.', total credits: '.$totalCredits);
            }

            return $entry->load('lines.account');
        });
    }

    public function post(JournalEntry $entry, ?string $userId = null): JournalEntry
    {
        if ($entry->status === 'posted') {
            return $entry;
        }

        return DB::transaction(function () use ($entry, $userId) {
            $entry->update([
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by_user_id' => $userId,
            ]);

            return $entry->load('lines.account', 'postedBy');
        });
    }

    public function reverse(JournalEntry $entry, ?string $userId = null): JournalEntry
    {
        if ($entry->status !== 'posted') {
            throw new \InvalidArgumentException('Only posted journal entries can be reversed.');
        }

        return DB::transaction(function () use ($entry, $userId) {
            $reversal = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $entry->organization_id,
                'business_id' => $entry->business_id,
                'reference_type' => 'reversal',
                'reference_id' => $entry->id,
                'entry_date' => now()->toDateString(),
                'notes' => 'Reversal of '.$entry->entry_date->format('Y-m-d').' entry',
                'status' => 'posted',
                'posted_at' => now(),
                'posted_by_user_id' => $userId,
                'entry_type' => 'reversal',
            ]);

            foreach ($entry->lines as $line) {
                JournalLine::create([
                    'id' => Str::uuid()->toString(),
                    'journal_entry_id' => $reversal->id,
                    'account_id' => $line->account_id,
                    'description' => 'Reversal: '.($line->description ?? ''),
                    'debit_minor' => $line->credit_minor,
                    'credit_minor' => $line->debit_minor,
                    'entry_type' => 'reversal',
                    'branch_id' => $line->branch_id,
                    'external_reference' => $line->external_reference,
                ]);
            }

            return $reversal->load('lines.account');
        });
    }

    public function getLedgerQuery(string $organizationId, ?array $filters = [])
    {
        $query = JournalLine::where('journal_entries.organization_id', $organizationId)
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->select(
                'journal_lines.*',
                'journal_entries.entry_date',
                'journal_entries.reference_type',
                'journal_entries.reference_id',
                'journal_entries.notes as entry_notes',
                'accounts.code as account_code',
                'accounts.name as account_name',
                'accounts.type as account_type',
            )
            ->where('journal_entries.status', 'posted')
            ->orderBy('journal_entries.entry_date', 'desc')
            ->orderBy('journal_entries.created_at', 'desc');

        if (!empty($filters['account_id'])) {
            $query->where('journal_lines.account_id', $filters['account_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('journal_lines.branch_id', $filters['branch_id']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('journal_entries.entry_date', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('journal_entries.entry_date', '<=', $filters['to_date']);
        }

        if (!empty($filters['reference_type'])) {
            $query->where('journal_entries.reference_type', $filters['reference_type']);
        }

        return $query;
    }

    public function postInvoiceJournal(string $organizationId, ?string $businessId, Invoice $invoice): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $invoice) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'invoice',
                'reference_id' => $invoice->id,
                'entry_date' => $invoice->issue_date ?? now()->toDateString(),
                'notes' => 'Invoice '.$invoice->invoice_number,
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $arAccount = $accounts['1200'] ?? $accounts->where('type', 'asset')->first();
            $salesAccount = $accounts['4000'] ?? $accounts->where('type', 'revenue')->first();
            $taxAccount = $accounts['2200'] ?? $accounts->where('type', 'liability')->first();

            if (! $arAccount || ! $salesAccount) {
                Log::warning('Missing required accounts for invoice journal', [
                    'invoice_id' => $invoice->id,
                    'has_ar' => (bool) $arAccount,
                    'has_sales' => (bool) $salesAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $arAccount->id,
                'description' => 'Invoice '.$invoice->invoice_number.' - AR',
                'debit_minor' => $invoice->grand_total_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $salesAccount->id,
                'description' => 'Invoice '.$invoice->invoice_number.' - Revenue',
                'debit_minor' => 0,
                'credit_minor' => $invoice->subtotal_minor,
                'entry_type' => 'system',
            ];

            if ($invoice->tax_total_minor > 0 && $taxAccount) {
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $taxAccount->id,
                    'description' => 'Invoice '.$invoice->invoice_number.' - Tax',
                    'debit_minor' => 0,
                    'credit_minor' => $invoice->tax_total_minor,
                    'entry_type' => 'system',
                ];
            }

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Invoice journal not balanced', [
                    'invoice_id' => $invoice->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postBillJournal(string $organizationId, ?string $businessId, Bill $bill): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $bill) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'bill',
                'reference_id' => $bill->id,
                'entry_date' => $bill->bill_date ?? now()->toDateString(),
                'notes' => 'Bill '.$bill->bill_number,
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $apAccount = $accounts['2100'] ?? $accounts->where('type', 'liability')->first();
            $expenseAccount = $accounts['6000'] ?? $accounts->where('type', 'expense')->first();
            $taxAccount = $accounts['2200'] ?? $accounts->where('type', 'liability')->first();

            if (! $apAccount || ! $expenseAccount) {
                Log::warning('Missing required accounts for bill journal', [
                    'bill_id' => $bill->id,
                    'has_ap' => (bool) $apAccount,
                    'has_expense' => (bool) $expenseAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $expenseAccount->id,
                'description' => 'Bill '.$bill->bill_number.' - Expense',
                'debit_minor' => $bill->grand_total_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $apAccount->id,
                'description' => 'Bill '.$bill->bill_number.' - AP',
                'debit_minor' => 0,
                'credit_minor' => $bill->grand_total_minor,
                'entry_type' => 'system',
            ];

            if ($bill->tax_total_minor > 0 && $taxAccount) {
                $lines[1]['credit_minor'] -= $bill->tax_total_minor;
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $taxAccount->id,
                    'description' => 'Bill '.$bill->bill_number.' - Tax',
                    'debit_minor' => 0,
                    'credit_minor' => $bill->tax_total_minor,
                    'entry_type' => 'system',
                ];
            }

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Bill journal not balanced', [
                    'bill_id' => $bill->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postExpenseJournal(string $organizationId, ?string $businessId, Expense $expense): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $expense) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'expense',
                'reference_id' => $expense->id,
                'entry_date' => $expense->expense_date ?? now()->toDateString(),
                'notes' => 'Expense '.$expense->expense_number ?? $expense->id,
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $expenseAccount = $accounts['6000'] ?? $accounts->where('type', 'expense')->first();
            $cashAccount = $accounts['1000'] ?? $accounts->where('type', 'asset')->first();

            if (! $expenseAccount || ! $cashAccount) {
                Log::warning('Missing required accounts for expense journal', [
                    'expense_id' => $expense->id,
                    'has_expense' => (bool) $expenseAccount,
                    'has_cash' => (bool) $cashAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $expenseAccount->id,
                'description' => 'Expense - '.$expense->description,
                'debit_minor' => $expense->amount_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $cashAccount->id,
                'description' => 'Expense - '.$expense->description,
                'debit_minor' => 0,
                'credit_minor' => $expense->amount_minor,
                'entry_type' => 'system',
            ];

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Expense journal not balanced', [
                    'expense_id' => $expense->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postPaymentJournal(string $organizationId, ?string $businessId, Payment $payment, ?Invoice $invoice = null): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $payment, $invoice) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'payment',
                'reference_id' => $payment->id,
                'entry_date' => now()->toDateString(),
                'notes' => 'Payment - '.($invoice?->invoice_number ?? $payment->reference ?? $payment->id),
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $arAccount = $accounts['1200'] ?? $accounts->where('type', 'asset')->first();
            $cashAccount = $accounts['1000'] ?? $accounts->where('type', 'asset')->first();

            if (! $cashAccount || ! $arAccount) {
                Log::warning('Missing required accounts for payment journal', [
                    'payment_id' => $payment->id,
                    'has_cash' => (bool) $cashAccount,
                    'has_ar' => (bool) $arAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $cashAccount->id,
                'description' => 'Payment received',
                'debit_minor' => $payment->amount_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $arAccount->id,
                'description' => 'Payment applied to invoice',
                'debit_minor' => 0,
                'credit_minor' => $payment->amount_minor,
                'entry_type' => 'system',
            ];

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Payment journal not balanced', [
                    'payment_id' => $payment->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postBillPaymentJournal(string $organizationId, ?string $businessId, Payment $payment, ?Bill $bill = null): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $payment, $bill) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'payment',
                'reference_id' => $payment->id,
                'entry_date' => now()->toDateString(),
                'notes' => 'Bill Payment - '.($bill?->bill_number ?? $payment->reference ?? $payment->id),
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $apAccount = $accounts['2100'] ?? $accounts->where('type', 'liability')->first();
            $cashAccount = $accounts['1000'] ?? $accounts->where('type', 'asset')->first();

            if (! $cashAccount || ! $apAccount) {
                Log::warning('Missing required accounts for bill payment journal', [
                    'payment_id' => $payment->id,
                    'has_cash' => (bool) $cashAccount,
                    'has_ap' => (bool) $apAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $apAccount->id,
                'description' => 'Bill payment',
                'debit_minor' => $payment->amount_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $cashAccount->id,
                'description' => 'Bill payment',
                'debit_minor' => 0,
                'credit_minor' => $payment->amount_minor,
                'entry_type' => 'system',
            ];

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Bill payment journal not balanced', [
                    'payment_id' => $payment->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postExpensePaymentJournal(string $organizationId, ?string $businessId, Payment $payment, ?Expense $expense = null): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $payment, $expense) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'payment',
                'reference_id' => $payment->id,
                'entry_date' => now()->toDateString(),
                'notes' => 'Expense Payment - '.($expense?->description ?? $payment->reference ?? $payment->id),
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $expenseAccount = $accounts['6000'] ?? $accounts->where('type', 'expense')->first();
            $cashAccount = $accounts['1000'] ?? $accounts->where('type', 'asset')->first();

            if (! $expenseAccount || ! $cashAccount) {
                Log::warning('Missing required accounts for expense payment journal', [
                    'payment_id' => $payment->id,
                    'has_expense' => (bool) $expenseAccount,
                    'has_cash' => (bool) $cashAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $expenseAccount->id,
                'description' => 'Expense payment',
                'debit_minor' => $payment->amount_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $cashAccount->id,
                'description' => 'Expense payment',
                'debit_minor' => 0,
                'credit_minor' => $payment->amount_minor,
                'entry_type' => 'system',
            ];

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Expense payment journal not balanced', [
                    'payment_id' => $payment->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postCreditNoteJournal(string $organizationId, ?string $businessId, CreditNote $creditNote): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $creditNote) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'credit_note',
                'reference_id' => $creditNote->id,
                'entry_date' => $creditNote->credit_date ?? now()->toDateString(),
                'notes' => 'Credit Note '.$creditNote->credit_note_number,
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $arAccount = $accounts['1200'] ?? $accounts->where('type', 'asset')->first();
            $salesAccount = $accounts['4000'] ?? $accounts->where('type', 'revenue')->first();
            $taxAccount = $accounts['2200'] ?? $accounts->where('type', 'liability')->first();

            if (! $arAccount || ! $salesAccount) {
                Log::warning('Missing required accounts for credit note journal', [
                    'credit_note_id' => $creditNote->id,
                    'has_ar' => (bool) $arAccount,
                    'has_sales' => (bool) $salesAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $salesAccount->id,
                'description' => 'Credit Note '.$creditNote->credit_note_number.' - Revenue',
                'debit_minor' => $creditNote->subtotal_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $arAccount->id,
                'description' => 'Credit Note '.$creditNote->credit_note_number.' - AR',
                'debit_minor' => 0,
                'credit_minor' => $creditNote->total_minor,
                'entry_type' => 'system',
            ];

            if ($creditNote->tax_total_minor > 0 && $taxAccount) {
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $taxAccount->id,
                    'description' => 'Credit Note '.$creditNote->credit_note_number.' - Tax',
                    'debit_minor' => $creditNote->tax_total_minor,
                    'credit_minor' => 0,
                    'entry_type' => 'system',
                ];
            }

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Credit note journal not balanced', [
                    'credit_note_id' => $creditNote->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }

    public function postDebitNoteJournal(string $organizationId, ?string $businessId, DebitNote $debitNote): ?JournalEntry
    {
        return DB::transaction(function () use ($organizationId, $businessId, $debitNote) {
            $entry = JournalEntry::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_id' => $businessId,
                'reference_type' => 'debit_note',
                'reference_id' => $debitNote->id,
                'entry_date' => $debitNote->debit_date ?? now()->toDateString(),
                'notes' => 'Debit Note '.$debitNote->debit_note_number,
                'entry_type' => 'system',
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            $accounts = Account::where('organization_id', $organizationId)
                ->where('business_id', $businessId)
                ->where('is_active', true)
                ->get()->keyBy('code');

            $apAccount = $accounts['2100'] ?? $accounts->where('type', 'liability')->first();
            $inventoryAccount = $accounts['1300'] ?? $accounts->where('type', 'asset')->first();
            $expenseAccount = $accounts['6000'] ?? $accounts->where('type', 'expense')->first();
            $taxAccount = $accounts['2200'] ?? $accounts->where('type', 'liability')->first();

            if (! $apAccount) {
                Log::warning('Missing required accounts for debit note journal', [
                    'debit_note_id' => $debitNote->id,
                    'has_ap' => (bool) $apAccount,
                ]);

                $entry->delete();
                return null;
            }

            $lines = [];

            $lines[] = [
                'journal_entry_id' => $entry->id,
                'account_id' => $apAccount->id,
                'description' => 'Debit Note '.$debitNote->debit_note_number.' - AP',
                'debit_minor' => $debitNote->total_minor,
                'credit_minor' => 0,
                'entry_type' => 'system',
            ];

            if ($inventoryAccount) {
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $inventoryAccount->id,
                    'description' => 'Debit Note '.$debitNote->debit_note_number.' - Inventory',
                    'debit_minor' => 0,
                    'credit_minor' => $debitNote->subtotal_minor,
                    'entry_type' => 'system',
                ];
            } elseif ($expenseAccount) {
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $expenseAccount->id,
                    'description' => 'Debit Note '.$debitNote->debit_note_number.' - Expense',
                    'debit_minor' => 0,
                    'credit_minor' => $debitNote->subtotal_minor,
                    'entry_type' => 'system',
                ];
            }

            if ($debitNote->tax_total_minor > 0 && $taxAccount) {
                $lines[] = [
                    'journal_entry_id' => $entry->id,
                    'account_id' => $taxAccount->id,
                    'description' => 'Debit Note '.$debitNote->debit_note_number.' - Tax',
                    'debit_minor' => 0,
                    'credit_minor' => $debitNote->tax_total_minor,
                    'entry_type' => 'system',
                ];
            }

            $totalDebits = array_sum(array_column($lines, 'debit_minor'));
            $totalCredits = array_sum(array_column($lines, 'credit_minor'));

            if ($totalDebits !== $totalCredits) {
                Log::error('Debit note journal not balanced', [
                    'debit_note_id' => $debitNote->id,
                    'total_debits' => $totalDebits,
                    'total_credits' => $totalCredits,
                ]);

                $entry->delete();
                return null;
            }

            foreach ($lines as $line) {
                JournalLine::create($line);
            }

            return $entry->load('lines.account');
        });
    }
}
