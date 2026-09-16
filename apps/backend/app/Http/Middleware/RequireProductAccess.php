<?php

namespace App\Http\Middleware;

use App\Services\EntitlementService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireProductAccess
{
    protected EntitlementService $entitlements;

    public function __construct(EntitlementService $entitlements)
    {
        $this->entitlements = $entitlements;
    }

    public function handle(Request $request, Closure $next, string $product): Response
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $organization = $user->organization;

        if (! $organization) {
            return response()->json(['message' => 'User not assigned to an organization'], 403);
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! $this->entitlements->tenantHasProduct($organization, $product)) {
            return response()->json(['message' => 'Product not available on your subscription'], 403);
        }

        return $next($request);
    }
}
