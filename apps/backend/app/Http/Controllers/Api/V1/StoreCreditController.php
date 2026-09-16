<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\StoreCredit;
use App\Http\Requests\StoreStoreCreditRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreCreditController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', StoreCredit::class);

        $credits = StoreCredit::where('organization_id', $request->user()->organization_id)
            ->with(['customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($credits);
    }

    public function store(StoreStoreCreditRequest $request)
    {
        $this->authorize('create', StoreCredit::class);

        $validated = $request->validated();
        $user = $request->user();
        $customer = Customer::where('organization_id', $user->organization_id)
            ->findOrFail($validated['customer_id']);

        $credit = DB::transaction(function () use ($validated, $user, $customer) {
            $credit = StoreCredit::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'customer_id' => $customer->id,
                'amount_minor' => $validated['amount_minor'],
                'currency' => $validated['currency'] ?? 'KES',
                'type' => $validated['type'] ?? 'issued',
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id' => $validated['reference_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            return $credit;
        });

        return response()->json(['data' => $credit->load('customer')], 201);
    }
}
