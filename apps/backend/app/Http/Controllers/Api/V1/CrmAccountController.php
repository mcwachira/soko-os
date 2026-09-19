<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CrmAccount;
use App\Http\Requests\StoreCrmAccountRequest;
use App\Http\Requests\UpdateCrmAccountRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CrmAccountController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CrmAccount::class);

        $query = CrmAccount::where('organization_id', $request->user()->organization_id)
            ->with(['owner', 'business']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('legal_name', 'ilike', "%{$search}%")
                    ->orWhere('trading_name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('kra_pin', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('account_type')) {
            $query->where('account_type', $request->account_type);
        }

        $accounts = $query->orderBy('legal_name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($accounts);
    }

    public function show(string $id)
    {
        $account = CrmAccount::where('organization_id', request()->user()->organization_id)
            ->with(['owner', 'business', 'contacts', 'deals', 'children', 'activities'])
            ->findOrFail($id);

        $this->authorize('view', $account);

        return response()->json(['data' => $account]);
    }

    public function store(StoreCrmAccountRequest $request)
    {
        $this->authorize('create', CrmAccount::class);

        $user = $request->user();
        $validated = $request->validated();

        $account = CrmAccount::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'parent_account_id' => $validated['parent_account_id'] ?? null,
            'owner_user_id' => $validated['owner_user_id'] ?? $user->id,
            'account_type' => $validated['account_type'] ?? 'customer',
            'legal_name' => $validated['legal_name'],
            'trading_name' => $validated['trading_name'] ?? $validated['legal_name'],
            'registration_number' => $validated['registration_number'] ?? null,
            'kra_pin' => $validated['kra_pin'] ?? null,
            'industry' => $validated['industry'] ?? null,
            'country_code' => $validated['country_code'] ?? 'KE',
            'county' => $validated['county'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'website' => $validated['website'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'credit_limit_minor' => $validated['credit_limit_minor'] ?? 0,
            'payment_terms' => $validated['payment_terms'] ?? null,
            'price_list' => $validated['price_list'] ?? null,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $account->load('owner', 'business')], 201);
    }

    public function update(UpdateCrmAccountRequest $request, string $id)
    {
        $account = CrmAccount::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $account);

        $validated = $request->validated();

        $account->update($validated);

        return response()->json(['data' => $account->load('owner', 'business')]);
    }

    public function destroy(string $id)
    {
        $account = CrmAccount::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $account);

        $account->delete();

        return response()->json(['message' => 'Account deleted']);
    }
}
