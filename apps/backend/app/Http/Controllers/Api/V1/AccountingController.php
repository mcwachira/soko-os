<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Account;
use App\Models\JournalEntry;
use App\Http\Controllers\Controller;
use App\Services\Accounting\JournalService;
use App\Services\Accounting\ReportService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AccountingController extends Controller
{
    public function __construct(
        protected JournalService $journalService,
        protected ReportService $reportService,
    ) {}

    public function accounts(Request $request)
    {
        $this->authorize('viewAny', Account::class);

        $accounts = Account::where('organization_id', $request->user()->organization_id)
            ->orderBy('code')
            ->paginate($request->integer('per_page', 100));

        return response()->json($accounts);
    }

    public function showAccount(string $id)
    {
        $account = Account::where('organization_id', request()->user()->organization_id)
            ->with('journalLines.journalEntry')
            ->findOrFail($id);

        $this->authorize('view', $account);

        return response()->json(['data' => $account]);
    }

    public function storeAccount(Request $request)
    {
        $this->authorize('create', Account::class);

        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'currency' => 'required|string|size:3',
        ]);

        $user = $request->user();

        $account = Account::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'currency' => $validated['currency'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $account], 201);
    }

    public function updateAccount(Request $request, string $id)
    {
        $account = Account::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $account);

        $validated = $request->validate([
            'code' => 'sometimes|string|max:50',
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:50',
            'currency' => 'sometimes|string|size:3',
        ]);

        $account->update($validated);

        return response()->json(['data' => $account]);
    }

    public function storeJournalEntry(Request $request)
    {
        $this->authorize('create', JournalEntry::class);

        $user = $request->user();

        $validated = $request->validate([
            'entry_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'entry_type' => ['nullable', 'string'],
            'reference_type' => ['nullable', 'string'],
            'reference_id' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $user->organization_id)],
            'lines.*.description' => ['nullable', 'string'],
            'lines.*.debit_minor' => ['required', 'integer', 'min:0'],
            'lines.*.credit_minor' => ['required', 'integer', 'min:0'],
            'lines.*.branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $user->organization_id)],
        ]);

        $entry = $this->journalService->createDraft(array_merge($validated, [
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
        ]));

        return response()->json(['data' => $entry], 201);
    }

    public function journalEntries(Request $request)
    {
        $this->authorize('viewAny', JournalEntry::class);

        $entries = JournalEntry::where('organization_id', $request->user()->organization_id)
            ->with('lines.account')
            ->orderBy('entry_date', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($entries);
    }

    public function showJournalEntry(string $id)
    {
        $entry = JournalEntry::where('organization_id', request()->user()->organization_id)
            ->with('lines.account')
            ->findOrFail($id);

        $this->authorize('view', $entry);

        return response()->json(['data' => $entry]);
    }

    public function postJournalEntry(string $id)
    {
        $entry = JournalEntry::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('journals.post', $entry);

        if ($this->isPeriodLocked($entry->entry_date, $entry->organization_id)) {
            return response()->json(['message' => 'Cannot post journal entry in a closed accounting period.'], 422);
        }

        $entry = $this->journalService->post($entry, request()->user()->id);

        return response()->json(['data' => $entry]);
    }

    public function reverseJournalEntry(string $id)
    {
        $entry = JournalEntry::where('organization_id', request()->user()->organization_id)
            ->where('status', 'posted')
            ->findOrFail($id);

        $this->authorize('journals.reverse', $entry);

        $reversalDate = request()->input('reversal_date', now()->format('Y-m-d'));
        if ($this->isPeriodLocked($reversalDate, $entry->organization_id)) {
            return response()->json(['message' => 'Cannot reverse journal entry in a closed accounting period.'], 422);
        }

        $reversal = $this->journalService->reverse($entry, request()->user()->id);

        return response()->json(['data' => $reversal]);
    }

    private function isPeriodLocked(string $date, string $organizationId): bool
    {
        $period = \App\Models\AccountingPeriod::forDate($date, $organizationId)->first();
        return $period && in_array($period->status, ['closed', 'locked'], true);
    }

    public function ledger(Request $request)
    {
        $this->authorize('journals.view');

        $filters = [
            'account_id' => $request->query('account_id'),
            'branch_id' => $request->query('branch_id'),
            'from_date' => $request->query('from_date'),
            'to_date' => $request->query('to_date'),
            'reference_type' => $request->query('reference_type'),
        ];

        $query = $this->journalService->getLedgerQuery($request->user()->organization_id, $filters);

        $results = $query->paginate($request->integer('per_page', 25));

        return response()->json($results);
    }

    public function trialBalance(Request $request)
    {
        $this->authorize('reports.view');

        $businessId = $request->query('business_id');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $data = $this->reportService->getTrialBalance(
            $request->user()->organization_id,
            $businessId,
            $fromDate,
            $toDate
        );

        return response()->json($data);
    }

    public function profitLoss(Request $request)
    {
        $this->authorize('reports.view');

        $businessId = $request->query('business_id');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $data = $this->reportService->getProfitAndLoss(
            $request->user()->organization_id,
            $businessId,
            $fromDate,
            $toDate
        );

        return response()->json($data);
    }

    public function balanceSheet(Request $request)
    {
        $this->authorize('reports.view');

        $businessId = $request->query('business_id');
        $asOfDate = $request->query('as_of_date');

        $data = $this->reportService->getBalanceSheet(
            $request->user()->organization_id,
            $businessId,
            $asOfDate
        );

        return response()->json($data);
    }

    public function cashFlow(Request $request)
    {
        $this->authorize('reports.view');

        $businessId = $request->query('business_id');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $data = $this->reportService->getCashFlow(
            $request->user()->organization_id,
            $businessId,
            $fromDate,
            $toDate
        );

        return response()->json($data);
    }
}

