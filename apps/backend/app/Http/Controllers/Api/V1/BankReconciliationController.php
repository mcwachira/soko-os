<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BankReconciliation;
use App\Http\Requests\StoreBankReconciliationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankReconciliationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', BankReconciliation::class);

        $query = BankReconciliation::where('organization_id', $request->user()->organization_id)
            ->with(['bankAccount']);

        if ($request->has('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reconciliations = $query->orderBy('statement_date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($reconciliations);
    }

    public function show(string $id)
    {
        $reconciliation = BankReconciliation::where('organization_id', request()->user()->organization_id)
            ->with(['bankAccount', 'items'])
            ->findOrFail($id);

        $this->authorize('view', $reconciliation);

        return response()->json(['data' => $reconciliation]);
    }

    public function store(StoreBankReconciliationRequest $request)
    {
        $this->authorize('create', BankReconciliation::class);

        $validated = $request->validated();
        $user = $request->user();

        $differenceMinor = $validated['statement_balance_minor'] - $validated['book_balance_minor'];

        $reconciliation = BankReconciliation::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'bank_account_id' => $validated['bank_account_id'],
            'statement_date' => $validated['statement_date'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'statement_balance_minor' => $validated['statement_balance_minor'],
            'book_balance_minor' => $validated['book_balance_minor'],
            'difference_minor' => $differenceMinor,
            'status' => $differenceMinor === 0 ? 'completed' : 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $reconciliation->load('bankAccount')], 201);
    }

    public function destroy(string $id)
    {
        $reconciliation = BankReconciliation::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $reconciliation);

        $reconciliation->delete();

        return response()->json(['message' => 'Bank reconciliation deleted']);
    }
}
