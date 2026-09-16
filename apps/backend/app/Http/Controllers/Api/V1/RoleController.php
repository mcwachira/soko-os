<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::where('organization_id', $request->user()->organization_id)
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($roles);
    }

    public function show(Request $request, string $id)
    {
        $role = Role::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $role);

        return response()->json(['data' => $role]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Role::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->where('organization_id', $request->user()->organization_id),
            ],
            'description' => 'nullable|string|max:1000',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $request->user()->organization_id,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'permissions' => $validated['permissions'] ?? [],
        ]);

        return response()->json(['data' => $role], 201);
    }

    public function update(Request $request, string $id)
    {
        $role = Role::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $role);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles')->where('organization_id', $request->user()->organization_id)->ignore($role->id),
            ],
            'description' => 'nullable|string|max:1000',
            'permissions' => 'nullable|array',
        ]);

        $role->update($validated);

        return response()->json(['data' => $role]);
    }

    public function destroy(Request $request, string $id)
    {
        $role = Role::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $role);

        $role->delete();

        return response()->json(['message' => 'Role deleted']);
    }
}
