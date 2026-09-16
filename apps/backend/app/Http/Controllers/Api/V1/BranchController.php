<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Branch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Branch::class);

        $branches = Branch::where('organization_id', $request->user()->organization_id)
            ->with('business')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($branches);
    }

    public function show(string $id)
    {
        $branch = Branch::where('organization_id', request()->user()->organization_id)
            ->with('business')
            ->findOrFail($id);

        $this->authorize('view', $branch);

        return response()->json(['data' => $branch]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Branch::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        $branch = Branch::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'address' => $validated['address'],
            'phone' => $validated['phone'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $branch->load('business')], 201);
    }

    public function update(Request $request, string $id)
    {
        $branch = Branch::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $branch);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
        ]);

        $branch->update($validated);

        return response()->json(['data' => $branch->load('business')]);
    }

    public function destroy(string $id)
    {
        $branch = Branch::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $branch);

        $branch->delete();

        return response()->json(['message' => 'Branch deleted']);
    }
}
