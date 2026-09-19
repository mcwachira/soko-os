<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PaymentAllocation;
use App\Http\Requests\StorePaymentAllocationRequest;
use App\Http\Requests\UpdatePaymentAllocationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentAllocationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PaymentAllocation::class);

        $allocations = PaymentAllocation::where('organization_id', $request->user()->organization_id)
            ->with(['payment', 'allocatable'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($allocations);
    }

    public function show(string $id)
    {
        $allocation = PaymentAllocation::where('organization_id', request()->user()->organization_id)
            ->with(['payment', 'allocatable'])
            ->findOrFail($id);

        $this->authorize('view', $allocation);

        return response()->json(['data' => $allocation]);
    }

    public function store(StorePaymentAllocationRequest $request)
    {
        $this->authorize('create', PaymentAllocation::class);

        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            $allocation = PaymentAllocation::create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'payment_id' => $validated['payment_id'],
                'allocatable_type' => $validated['allocatable_type'],
                'allocatable_id' => $validated['allocatable_id'],
                'allocated_minor' => $validated['allocated_minor'],
            ]);

            return response()->json(['data' => $allocation->load('payment', 'allocatable')], 201);
        });
    }

    public function update(UpdatePaymentAllocationRequest $request, string $id)
    {
        $allocation = PaymentAllocation::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $allocation);

        $validated = $request->validated();

        $allocation->update($validated);

        return response()->json(['data' => $allocation->load('payment', 'allocatable')]);
    }

    public function destroy(string $id)
    {
        $allocation = PaymentAllocation::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $allocation);

        $allocation->delete();

        return response()->json(['message' => 'Payment allocation deleted']);
    }
}

