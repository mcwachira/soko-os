<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Expense::class);

        $query = Expense::where('organization_id', $request->user()->organization_id)
            ->with(['category', 'account', 'bankAccount', 'supplier']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $expenses = $query->orderBy('expense_date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($expenses);
    }

    public function show(string $id)
    {
        $expense = Expense::where('organization_id', request()->user()->organization_id)
            ->with(['category', 'account', 'bankAccount', 'supplier', 'createdBy', 'approvedBy'])
            ->findOrFail($id);

        $this->authorize('view', $expense);

        return response()->json(['data' => $expense]);
    }

    public function store(StoreExpenseRequest $request)
    {
        $this->authorize('create', Expense::class);

        $validated = $request->validated();
        $user = $request->user();

        $status = $validated['status'] ?? 'draft';
        $approvedByUserId = null;

        if (in_array($status, ['submitted', 'approved'])) {
            $approvedByUserId = $user->id;
        }

        $expense = Expense::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'supplier_id' => $validated['supplier_id'] ?? null,
            'expense_category_id' => $validated['expense_category_id'] ?? null,
            'account_id' => $validated['account_id'] ?? null,
            'bank_account_id' => $validated['bank_account_id'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'created_by_user_id' => $user->id,
            'approved_by_user_id' => $approvedByUserId,
            'expense_number' => 'EXP-'.strtoupper(\Illuminate\Support\Str::random(8)),
            'status' => $status,
            'expense_date' => $validated['expense_date'],
            'payment_date' => $validated['payment_date'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
            'reference' => $validated['reference'] ?? null,
            'payee_name' => $validated['payee_name'],
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'receipt_path' => $validated['receipt_path'] ?? null,
            'amount_minor' => $validated['amount_minor'],
            'tax_minor' => $validated['tax_minor'] ?? 0,
            'total_minor' => ($validated['amount_minor'] ?? 0) + ($validated['tax_minor'] ?? 0),
        ]);

        return response()->json(['data' => $expense->load('category', 'account', 'bankAccount', 'supplier')], 201);
    }

    public function update(UpdateExpenseRequest $request, string $id)
    {
        $expense = Expense::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $expense);

        $validated = $request->validated();
        $user = $request->user();

        if (isset($validated['status']) && in_array($validated['status'], ['submitted', 'approved']) && !$expense->approved_by_user_id) {
            $validated['approved_by_user_id'] = $user->id;
        }

        $expense->update($validated);

        return response()->json(['data' => $expense->load('category', 'account', 'bankAccount', 'supplier')]);
    }

    public function destroy(string $id)
    {
        $expense = Expense::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $expense);

        $expense->delete();

        return response()->json(['message' => 'Expense deleted']);
    }

    public function approve(Request $request, string $id, JournalService $journalService)
    {
        $expense = Expense::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $expense);

        if (in_array($expense->status, ['approved', 'paid', 'reimbursed'])) {
            return response()->json(['message' => 'Expense is already approved or paid'], 422);
        }

        $expense->update([
            'status' => 'approved',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $journalService->postExpenseJournal($expense->organization_id, $expense->business_id, $expense);

        return response()->json(['data' => $expense->load('category', 'account', 'bankAccount', 'supplier', 'createdBy', 'approvedBy')]);
    }
}
