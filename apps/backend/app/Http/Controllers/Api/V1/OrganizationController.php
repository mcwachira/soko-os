<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Organization;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Organization::class);

        $query = Organization::query();

        $permissions = $request->user()->permissions ?? [];
        $isSuperAdmin = in_array('*', $permissions) || $permissions['is_super_admin'] ?? false;

        if (! $isSuperAdmin) {
            $query->where('id', $request->user()->organization_id);
        }

        $organizations = $query->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($organizations);
    }

    public function show(string $id)
    {
        $user = request()->user();
        $permissions = $user->permissions ?? [];
        $isSuperAdmin = in_array('*', $permissions) || $permissions['is_super_admin'] ?? false;

        $organization = Organization::where('id', $id)
            ->when(! $isSuperAdmin, function ($q) use ($user) {
                $q->where('id', $user->organization_id);
            })
            ->findOrFail($id);

        $this->authorize('view', $organization);

        return response()->json(['data' => $organization]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Organization::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:organizations,slug',
            'tax_number' => 'nullable|string|max:50',
            'country_code' => 'required|string|size:2',
            'currency' => 'required|string|size:3',
        ]);

        $organization = Organization::create($validated);

        return response()->json(['data' => $organization], 201);
    }

    public function update(Request $request, string $id)
    {
        $user = request()->user();
        $permissions = $user->permissions ?? [];
        $isSuperAdmin = in_array('*', $permissions) || $permissions['is_super_admin'] ?? false;

        $organization = Organization::where('id', $id)
            ->when(! $isSuperAdmin, function ($q) use ($user) {
                $q->where('id', $user->organization_id);
            })
            ->findOrFail($id);

        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', \Illuminate\Validation\Rule::unique('organizations', 'slug')->ignore($id)],
            'tax_number' => 'nullable|string|max:50',
            'country_code' => 'sometimes|string|size:2',
            'currency' => 'sometimes|string|size:3',
        ]);

        $organization->update($validated);

        return response()->json(['data' => $organization]);
    }

    public function destroy(string $id)
    {
        $user = request()->user();
        $permissions = $user->permissions ?? [];
        $isSuperAdmin = in_array('*', $permissions) || $permissions['is_super_admin'] ?? false;

        $organization = Organization::where('id', $id)
            ->when(! $isSuperAdmin, function ($q) use ($user) {
                $q->where('id', $user->organization_id);
            })
            ->findOrFail($id);

        $this->authorize('delete', $organization);

        $organization->delete();

        return response()->json(['message' => 'Organization deleted']);
    }
}
