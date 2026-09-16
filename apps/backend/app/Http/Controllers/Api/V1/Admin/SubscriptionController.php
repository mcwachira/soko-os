<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Subscription::class);

        $subscriptions = Subscription::query()
            ->with(['organization', 'plan'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json($subscriptions);
    }

    public function show(string $id)
    {
        $this->authorize('view', Subscription::class);

        $subscription = Subscription::with(['organization', 'plan', 'items.product'])
            ->findOrFail($id);

        return response()->json(['data' => $subscription]);
    }

    public function update(Request $request, string $id)
    {
        $this->authorize('update', Subscription::class);

        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['trial', 'active', 'past_due', 'suspended', 'cancelled', 'ended'])],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'current_period_ends_at' => 'nullable|date',
            'trial_ends_at' => 'nullable|date',
            'cancelled_at' => 'nullable|date',
            'ended_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $subscription->update($validated);

        return response()->json(['data' => $subscription]);
    }
}
