<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Http\Requests\StoreBankAccountRequest;
use App\Http\Requests\UpdateBankAccountRequest;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', BankAccount::class);

        $bankAccounts = BankAccount::where('organization_id', $request->user()->organization_id)
            ->with('ledgerAccount')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($bankAccounts);
    }

    public function show(string $id)
    {
        $bankAccount = BankAccount::where('organization_id', request()->user()->organization_id)
            ->with('ledgerAccount')
            ->findOrFail($id);

        $this->authorize('view', $bankAccount);

        return response()->json(['data' => $bankAccount]);
    }

    public function store(StoreBankAccountRequest $request)
    {
        $this->authorize('create', BankAccount::class);

        $validated = $request->validated();
        $user = $request->user();

        $bankAccount = BankAccount::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'account_id' => $validated['account_id'] ?? null,
            'name' => $validated['name'],
            'account_number_masked' => $validated['account_number_masked'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'currency' => $validated['currency'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $bankAccount->load('ledgerAccount')], 201);
    }

    public function update(UpdateBankAccountRequest $request, string $id)
    {
        $bankAccount = BankAccount::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $bankAccount);

        $validated = $request->validated();

        $bankAccount->update($validated);

        return response()->json(['data' => $bankAccount->load('ledgerAccount')]);
    }

    public function destroy(string $id)
    {
        $bankAccount = BankAccount::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $bankAccount);

        $bankAccount->delete();

        return response()->json(['message' => 'Bank account deleted']);
    }
}
