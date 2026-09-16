<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\TenantMembership;
use App\Models\User;
use App\Services\EntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    protected EntitlementService $entitlements;

    public function __construct(EntitlementService $entitlements)
    {
        $this->entitlements = $entitlements;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Organization::class);

        $organizations = Organization::query()
            ->with(['subscriptions', 'users'])
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($organizations);
    }

    public function show(string $id)
    {
        $this->authorize('view', Organization::class);

        $organization = Organization::with(['subscriptions', 'users', 'memberships.user', 'memberships.role'])
            ->findOrFail($id);

        $subscription = $this->entitlements->getSubscription($organization);
        $entitlements = $this->entitlements->getTenantEntitlements($organization);

        return response()->json([
            'data' => [
                'organization' => $organization,
                'subscription' => $subscription,
                'entitlements' => $entitlements,
                'users' => $organization->users,
                'memberships' => $organization->memberships,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Organization::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:organizations,slug',
            'legal_name' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|size:2',
            'currency' => 'required|string|size:3',
            'timezone' => 'nullable|string|max:100',
            'status' => ['nullable', Rule::in(['trial', 'active', 'past_due', 'suspended', 'cancelled'])],
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email',
            'owner_password' => 'required|string|min:8',
            'plan_id' => 'nullable|uuid|exists:plans,id',
            'product_ids' => 'nullable|array',
        ]);

        $organization = \DB::transaction(function () use ($validated) {
            $org = Organization::create([
                'id' => Str::uuid()->toString(),
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'tax_number' => $validated['legal_name'] ?? null,
                'country_code' => $validated['country'] ?? 'KE',
                'currency' => $validated['currency'],
            ]);

            $business = $org->businesses()->create([
                'id' => Str::uuid()->toString(),
                'name' => $validated['name'],
                'business_type' => 'general',
                'currency' => $validated['currency'],
                'is_active' => true,
            ]);

            $owner = User::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $org->id,
                'business_id' => $business->id,
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => bcrypt($validated['owner_password']),
                'role' => 'owner',
                'permissions' => ['*'],
                'is_active' => true,
            ]);

            $ownerRole = \App\Models\Role::where('organization_id', $org->id)
                ->where('slug', 'owner')
                ->first();

            if ($ownerRole) {
                $owner->role_id = $ownerRole->id;
                $owner->save();
            }

            TenantMembership::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $org->id,
                'business_id' => $business->id,
                'user_id' => $owner->id,
                'role_id' => $ownerRole?->id,
                'status' => 'active',
                'joined_at' => now(),
            ]);

            if (! empty($validated['plan_id'])) {
                $subscription = Subscription::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $org->id,
                    'plan_id' => $validated['plan_id'],
                    'status' => 'trial',
                    'payment_status' => 'pending',
                    'trial_ends_at' => now()->addDays(14),
                    'current_period_started_at' => now(),
                    'current_period_ends_at' => now()->addMonth(),
                ]);

                $plan = \App\Models\Plan::find($validated['plan_id']);

                if ($plan) {
                    $productIds = $validated['product_ids'] ?? $plan->products()->where('enabled', true)->pluck('products.id')->all();

                    foreach ($productIds as $productId) {
                        SubscriptionItem::create([
                            'id' => Str::uuid()->toString(),
                            'subscription_id' => $subscription->id,
                            'product_id' => $productId,
                            'enabled' => true,
                        ]);
                    }
                }
            }

            return $org;
        });

        return response()->json(['data' => $organization], 201);
    }

    public function update(Request $request, string $id)
    {
        $this->authorize('update', Organization::class);

        $organization = Organization::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('organizations', 'slug')->ignore($id)],
            'status' => ['sometimes', Rule::in(['trial', 'active', 'past_due', 'suspended', 'cancelled'])],
        ]);

        $organization->update($validated);

        return response()->json(['data' => $organization]);
    }

    public function suspend(string $id)
    {
        $this->authorize('update', Organization::class);

        $organization = Organization::findOrFail($id);
        $organization->update(['status' => 'suspended']);

        $subscription = $this->entitlements->getSubscription($organization);
        if ($subscription) {
            $subscription->update(['status' => 'suspended']);
        }

        return response()->json(['message' => 'Tenant suspended']);
    }

    public function activate(string $id)
    {
        $this->authorize('update', Organization::class);

        $organization = Organization::findOrFail($id);
        $organization->update(['status' => 'active']);

        $subscription = $this->entitlements->getSubscription($organization);
        if ($subscription) {
            $subscription->update(['status' => 'active']);
        }

        return response()->json(['message' => 'Tenant activated']);
    }
}
