<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Customer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $query = Customer::where('organization_id', $request->user()->organization_id)
            ->with('business');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $customers = $query->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($customers);
    }

    public function show(string $id)
    {
        $customer = Customer::where('organization_id', request()->user()->organization_id)
            ->with('business')
            ->findOrFail($id);

        $this->authorize('view', $customer);

        return response()->json(['data' => $customer]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Customer::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'tax_pin' => 'nullable|string|max:50',
            'credit_limit_minor' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();

        $customer = Customer::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'tax_pin' => $validated['tax_pin'],
            'credit_limit_minor' => $validated['credit_limit_minor'] ?? 0,
            'current_balance_minor' => 0,
            'loyalty_points' => 0,
        ]);

        return response()->json(['data' => $customer->load('business')], 201);
    }

    public function update(Request $request, string $id)
    {
        $customer = Customer::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $customer);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => 'nullable|string|max:50',
            'tax_pin' => 'nullable|string|max:50',
            'credit_limit_minor' => 'nullable|integer|min:0',
        ]);

        $customer->update($validated);

        return response()->json(['data' => $customer->load('business')]);
    }

    public function destroy(string $id)
    {
        $customer = Customer::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $customer);

        $customer->delete();

        return response()->json(['message' => 'Customer deleted']);
    }
}
