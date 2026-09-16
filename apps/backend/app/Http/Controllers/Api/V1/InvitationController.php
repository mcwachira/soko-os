<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InvitationController extends Controller
{
    public function index(Request $request)
    {
        $invitations = Invitation::where('organization_id', Auth::user()->organization_id)
            ->with(['role', 'invitedBy'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'role_id' => 'nullable|uuid|exists:roles,id',
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $user = Auth::user();

        $validated['organization_id'] = $user->organization_id;
        $validated['business_id'] = $validated['business_id'] ?? $user->business_id;
        $validated['invited_by_user_id'] = $user->id;
        $validated['token'] = Str::random(64);
        $validated['status'] = 'pending';
        $validated['expires_at'] = $validated['expires_at'] ?? now()->addDays(7);

        $invitation = Invitation::create($validated);

        return response()->json(['data' => $invitation], 201);
    }

    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $invitation = Invitation::where('token', $validated['token'])
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        DB::transaction(function () use ($invitation) {
            $user = User::where('email', $invitation->email)->first();

            if (! $user) {
                $user = User::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $invitation->organization_id,
                    'business_id' => $invitation->business_id,
                    'email' => $invitation->email,
                    'name' => $invitation->email,
                    'password' => bcrypt(Str::random(32)),
                    'role' => 'member',
                    'permissions' => [],
                    'is_active' => true,
                ]);
            }

            $invitation->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'accepted_by_user_id' => $user->id,
            ]);

            TenantMembership::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $invitation->organization_id,
                'business_id' => $invitation->business_id,
                'user_id' => $user->id,
                'role_id' => $invitation->role_id,
                'status' => 'active',
                'joined_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Invitation accepted']);
    }

    public function destroy(string $id)
    {
        $invitation = Invitation::where('organization_id', Auth::user()->organization_id)
            ->findOrFail($id);

        $invitation->delete();

        return response()->json(['message' => 'Invitation cancelled']);
    }
}
