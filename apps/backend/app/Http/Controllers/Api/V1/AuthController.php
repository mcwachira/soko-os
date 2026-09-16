<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Organization;
use App\Models\TenantMembership;
use App\Models\User;
use App\Services\EntitlementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected EntitlementService $entitlements;

    public function __construct(EntitlementService $entitlements)
    {
        $this->entitlements = $entitlements;
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_uuid' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is deactivated.'],
            ]);
        }

        $token = $user->createToken('soko-pos', ['*'], now()->addDays(30))->plainTextToken;

        $user->load('organization', 'business', 'memberships.organization', 'memberships.role');

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'permissions' => $user->permissions,
                    'organization_id' => $user->organization_id,
                    'business_id' => $user->business_id,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'memberships' => $user->memberships->map(function ($m) {
                        return [
                            'organization_id' => $m->organization_id,
                            'organization_name' => $m->organization?->name,
                            'role_id' => $m->role_id,
                            'role_slug' => $m->role?->slug,
                            'status' => $m->status,
                        ];
                    })->values()->all(),
                ],
            ],
            'message' => 'Login successful',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('organization', 'business', 'memberships.organization', 'memberships.role');

        $organization = $user->organization;
        $entitlements = [];
        $subscription = null;

        if ($organization && ! $user->isSuperAdmin()) {
            $entitlements = $this->entitlements->getTenantEntitlements($organization);
            $subscription = $this->entitlements->getSubscription($organization);
        }

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'permissions' => $user->permissions,
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'is_super_admin' => $user->isSuperAdmin(),
                'organization' => $organization ? [
                    'id' => $organization->id,
                    'name' => $organization->name,
                    'slug' => $organization->slug,
                ] : null,
                'business' => $user->business ? [
                    'id' => $user->business->id,
                    'name' => $user->business->name,
                ] : null,
                'subscription' => $subscription ? [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                    'plan_name' => $subscription->plan?->name,
                    'current_period_ends_at' => $subscription->current_period_ends_at,
                ] : null,
                'entitlements' => [
                    'products' => array_combine($entitlements, array_fill(0, count($entitlements), true)),
                ],
                'memberships' => $user->memberships->map(function ($m) {
                    return [
                        'organization_id' => $m->organization_id,
                        'organization_name' => $m->organization?->name,
                        'role_id' => $m->role_id,
                        'role_slug' => $m->role?->slug,
                        'status' => $m->status,
                    ];
                })->values()->all(),
            ],
        ]);
    }

    public function switchTenant(Request $request)
    {
        $validated = $request->validate([
            'organization_id' => 'required|uuid|exists:organizations,id',
        ]);

        $user = $request->user();
        $membership = $user->memberships()
            ->where('organization_id', $validated['organization_id'])
            ->active()
            ->first();

        if (! $membership && ! $user->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'organization_id' => ['You are not a member of this organization.'],
            ]);
        }

        $user->update([
            'organization_id' => $validated['organization_id'],
            'business_id' => null,
        ]);

        $user->load('organization', 'business', 'memberships.organization', 'memberships.role');

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'permissions' => $user->permissions,
                    'organization_id' => $user->organization_id,
                    'business_id' => $user->business_id,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'organization' => $user->organization ? [
                        'id' => $user->organization->id,
                        'name' => $user->organization->name,
                    ] : null,
                ],
            ],
            'message' => 'Tenant switched successfully',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'If that email exists, a reset link will be sent']);
        }

        return response()->json(['message' => 'If that email exists, a reset link will be sent']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid reset credentials'], 400);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
