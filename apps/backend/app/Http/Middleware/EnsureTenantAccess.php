<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user->organization_id) {
            return response()->json(['message' => 'User not assigned to an organization'], 403);
        }

        // Add organization_id to request for easy access in controllers
        $request->merge(['organization_id' => $user->organization_id]);

        // If branch_id is provided in request, verify it belongs to user's organization
        if ($request->has('branch_id')) {
            $branch = Branch::where('id', $request->branch_id)
                ->where('organization_id', $user->organization_id)
                ->first();

            if (! $branch) {
                return response()->json(['message' => 'Branch not found or access denied'], 403);
            }
        }

        // If business_id is provided, verify it belongs to user's organization
        if ($request->has('business_id')) {
            $business = Business::where('id', $request->business_id)
                ->where('organization_id', $user->organization_id)
                ->first();

            if (! $business) {
                return response()->json(['message' => 'Business not found or access denied'], 403);
            }
        }

        return $next($request);
    }
}
