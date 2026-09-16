<?php

namespace App\Services\Accounting;

use App\Models\Account;
use App\Models\JournalLine;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getTrialBalance(string $organizationId, ?string $businessId = null, ?string $fromDate = null, ?string $toDate = null): array
    {
        $query = JournalLine::where('journal_entries.organization_id', $organizationId)
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->select(
                'accounts.id',
                'accounts.code',
                'accounts.name',
                'accounts.type',
                DB::raw('SUM(journal_lines.debit_minor) as total_debit_minor'),
                DB::raw('SUM(journal_lines.credit_minor) as total_credit_minor'),
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');

        if ($businessId) {
            $query->where('journal_entries.business_id', $businessId);
        }

        if ($fromDate) {
            $query->whereDate('journal_entries.entry_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('journal_entries.entry_date', '<=', $toDate);
        }

        $rows = $query->get();

        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($rows as $row) {
            $totalDebits += $row->total_debit_minor;
            $totalCredits += $row->total_credit_minor;
        }

        return [
            'generated_at' => now()->toIso8601String(),
            'filters' => compact('fromDate', 'toDate', 'businessId'),
            'data' => [
                'accounts' => $rows,
                'totals' => [
                    'total_debits_minor' => $totalDebits,
                    'total_credits_minor' => $totalCredits,
                    'is_balanced' => $totalDebits === $totalCredits,
                ],
            ],
        ];
    }

    public function getProfitAndLoss(string $organizationId, ?string $businessId = null, ?string $fromDate = null, ?string $toDate = null): array
    {
        $query = JournalLine::where('journal_entries.organization_id', $organizationId)
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->whereIn('accounts.type', ['revenue', 'expense'])
            ->select(
                'accounts.id',
                'accounts.code',
                'accounts.name',
                'accounts.type',
                DB::raw('SUM(journal_lines.debit_minor) as total_debit_minor'),
                DB::raw('SUM(journal_lines.credit_minor) as total_credit_minor'),
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');

        if ($businessId) {
            $query->where('journal_entries.business_id', $businessId);
        }

        if ($fromDate) {
            $query->whereDate('journal_entries.entry_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('journal_entries.entry_date', '<=', $toDate);
        }

        $rows = $query->get();

        $revenue = $rows->where('type', 'revenue')->sum('total_credit_minor');
        $expenses = $rows->where('type', 'expense')->sum('total_debit_minor');
        $netProfit = $revenue - $expenses;

        return [
            'generated_at' => now()->toIso8601String(),
            'filters' => compact('fromDate', 'toDate', 'businessId'),
            'data' => [
                'revenue_total_minor' => $revenue,
                'expense_total_minor' => $expenses,
                'net_profit_minor' => $netProfit,
                'accounts' => $rows,
            ],
        ];
    }

    public function getBalanceSheet(string $organizationId, ?string $businessId = null, ?string $asOfDate = null): array
    {
        $asOfDate = $asOfDate ?: now()->toDateString();

        $query = JournalLine::where('journal_entries.organization_id', $organizationId)
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->whereDate('journal_entries.entry_date', '<=', $asOfDate)
            ->whereIn('accounts.type', ['asset', 'liability', 'equity'])
            ->select(
                'accounts.id',
                'accounts.code',
                'accounts.name',
                'accounts.type',
                DB::raw('SUM(journal_lines.debit_minor) as total_debit_minor'),
                DB::raw('SUM(journal_lines.credit_minor) as total_credit_minor'),
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');

        if ($businessId) {
            $query->where('journal_entries.business_id', $businessId);
        }

        $rows = $query->get();

        $assets = $rows->where('type', 'asset')->sum(fn($r) => $r->total_debit_minor - $r->total_credit_minor);
        $liabilities = $rows->where('type', 'liability')->sum(fn($r) => $r->total_credit_minor - $r->total_debit_minor);
        $equity = $rows->where('type', 'equity')->sum(fn($r) => $r->total_credit_minor - $r->total_debit_minor);

        return [
            'generated_at' => now()->toIso8601String(),
            'as_of_date' => $asOfDate,
            'filters' => compact('businessId'),
            'data' => [
                'assets_minor' => max($assets, 0),
                'liabilities_minor' => max($liabilities, 0),
                'equity_minor' => max($equity, 0),
                'is_balanced' => abs($assets - ($liabilities + $equity)) < 1,
                'accounts' => $rows,
            ],
        ];
    }

    public function getCashFlow(string $organizationId, ?string $businessId = null, ?string $fromDate = null, ?string $toDate = null): array
    {
        $query = JournalLine::where('journal_entries.organization_id', $organizationId)
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->where('accounts.type', 'asset')
            ->where('accounts.code', 'like', '1000%')
            ->select(
                'accounts.id',
                'accounts.code',
                'accounts.name',
                DB::raw('SUM(journal_lines.debit_minor) as total_in_minor'),
                DB::raw('SUM(journal_lines.credit_minor) as total_out_minor'),
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name')
            ->orderBy('accounts.code');

        if ($businessId) {
            $query->where('journal_entries.business_id', $businessId);
        }

        if ($fromDate) {
            $query->whereDate('journal_entries.entry_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('journal_entries.entry_date', '<=', $toDate);
        }

        $rows = $query->get();

        return [
            'generated_at' => now()->toIso8601String(),
            'filters' => compact('fromDate', 'toDate', 'businessId'),
            'data' => [
                'accounts' => $rows,
                'note' => 'Cash flow derived from cash/bank accounts (codes 1000-1099).',
            ],
        ];
    }
}
