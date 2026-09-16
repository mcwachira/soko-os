<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\EntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function __construct(protected EntitlementService $entitlements) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $this->entitlements->getSubscription($user->organization);
        $entitlements = $this->entitlements->getTenantEntitlements($user->organization);

        return response()->json([
            'data' => [
                'subscription' => $subscription ? [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                    'plan_name' => $subscription->plan?->name,
                    'current_period_ends_at' => $subscription->current_period_ends_at,
                ] : null,
                'entitlements' => $entitlements,
            ],
        ]);
    }

    public function show(string $id)
    {
        $subscription = Subscription::where('organization_id', Auth::user()->organization_id)
            ->with(['plan', 'items.product'])
            ->findOrFail($id);

        return response()->json(['data' => $subscription]);
    }

    public function update(Request $request, string $id)
    {
        $this->authorize('update', Subscription::class);

        $subscription = Subscription::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $subscription->update($validated);

        return response()->json(['data' => $subscription]);
    }
}
