<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Http\Requests\StoreBankTransactionRequest;
use Illuminate\Http\Request;

class BankTransactionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', BankTransaction::class);

        $query = BankTransaction::where('organization_id', $request->user()->organization_id)
            ->with(['bankAccount', 'journalEntry']);

        if ($request->has('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('direction')) {
            $query->where('direction', $request->direction);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($transactions);
    }

    public function show(string $id)
    {
        $transaction = BankTransaction::where('organization_id', request()->user()->organization_id)
            ->with(['bankAccount', 'journalEntry'])
            ->findOrFail($id);

        $this->authorize('view', $transaction);

        return response()->json(['data' => $transaction]);
    }

    public function store(StoreBankTransactionRequest $request)
    {
        $this->authorize('create', BankTransaction::class);

        $validated = $request->validated();
        $user = $request->user();

        $transaction = BankTransaction::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'bank_account_id' => $validated['bank_account_id'],
            'type' => $validated['type'],
            'direction' => $validated['direction'],
            'transaction_date' => $validated['transaction_date'],
            'reference' => $validated['reference'] ?? null,
            'description' => $validated['description'] ?? null,
            'counterparty' => $validated['counterparty'] ?? null,
            'amount_minor' => $validated['amount_minor'],
            'currency' => $validated['currency'],
            'status' => 'pending',
            'source' => $validated['source'],
            'external_id' => $validated['external_id'] ?? null,
        ]);

        return response()->json(['data' => $transaction->load('bankAccount', 'journalEntry')], 201);
    }

    public function destroy(string $id)
    {
        $transaction = BankTransaction::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $transaction);

        $transaction->delete();

        return response()->json(['message' => 'Bank transaction deleted']);
    }
}
