<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Plan::class);

        $plans = Plan::query()
            ->orderBy('price_minor')
            ->paginate($request->integer('per_page', 50));

        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Plan::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:100|unique:plans,key',
            'description' => 'nullable|string|max:1000',
            'status' => ['nullable', Rule::in(['draft', 'active', 'archived'])],
            'billing_interval' => ['nullable', Rule::in(['monthly', 'yearly', 'weekly', 'one_time'])],
            'currency' => 'required|string|size:3',
            'price_minor' => 'required|integer|min:0',
            'trial_days' => 'nullable|integer|min:0',
            'grace_period_days' => 'nullable|integer|min:0',
        ]);

        $plan = Plan::create($validated);

        return response()->json(['data' => $plan], 201);
    }

    public function update(Request $request, string $id)
    {
        $this->authorize('update', Plan::class);

        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'key' => ['sometimes', 'string', 'max:100', Rule::unique('plans', 'key')->ignore($id)],
            'description' => 'nullable|string|max:1000',
            'status' => ['sometimes', Rule::in(['draft', 'active', 'archived'])],
            'billing_interval' => ['sometimes', Rule::in(['monthly', 'yearly', 'weekly', 'one_time'])],
            'currency' => 'sometimes|string|size:3',
            'price_minor' => 'sometimes|integer|min:0',
            'trial_days' => 'nullable|integer|min:0',
            'grace_period_days' => 'nullable|integer|min:0',
        ]);

        $plan->update($validated);

        return response()->json(['data' => $plan]);
    }

    public function destroy(string $id)
    {
        $this->authorize('delete', Plan::class);

        $plan = Plan::findOrFail($id);
        $plan->delete();

        return response()->json(['message' => 'Plan deleted']);
    }
}
