<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::where('organization_id', $request->user()->organization_id)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function show(string $id)
    {
        $category = Category::where('organization_id', request()->user()->organization_id)
            ->with('children', 'products')
            ->findOrFail($id);

        $this->authorize('view', $category);

        return response()->json(['data' => $category]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,NULL,id,organization_id,'.$request->user()->organization_id,
            'parent_id' => 'nullable|uuid|exists:categories,id',
        ]);

        $user = $request->user();

        $category = Category::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, string $id)
    {
        $category = Category::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('categories')->where('organization_id', $request->user()->organization_id)->ignore($id)],
            'parent_id' => 'nullable|uuid|exists:categories,id',
        ]);

        $category->update($validated);

        return response()->json(['data' => $category]);
    }

    public function destroy(string $id)
    {
        $category = Category::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $category);

        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with children'], 422);
        }

        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete category with products'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}
