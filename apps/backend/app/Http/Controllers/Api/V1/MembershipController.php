<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TenantMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MembershipController extends Controller
{
    public function index(Request $request)
    {
        $memberships = TenantMembership::where('organization_id', Auth::user()->organization_id)
            ->with(['user', 'role'])
            ->orderByDesc('joined_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json($memberships);
    }

    public function update(Request $request, string $id)
    {
        $membership = TenantMembership::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'nullable|uuid|exists:roles,id',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $membership->update($validated);

        return response()->json(['data' => $membership->load('user', 'role')]);
    }

    public function destroy(string $id)
    {
        $membership = TenantMembership::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $membership->update([
            'status' => 'inactive',
            'left_at' => now(),
        ]);

        return response()->json(['message' => 'Member removed']);
    }
}
