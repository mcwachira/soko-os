<?php

namespace App\Services\Accounting;

use App\Models\Account;
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
}
