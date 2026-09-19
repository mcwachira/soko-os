<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use App\Http\Requests\StoreExpenseCategoryRequest;
use App\Http\Requests\UpdateExpenseCategoryRequest;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ExpenseCategory::class);

        $categories = ExpenseCategory::where('organization_id', $request->user()->organization_id)
            ->with(['account'])
            ->orderBy('name', 'asc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($categories);
    }

    public function show(string $id)
    {
        $category = ExpenseCategory::where('organization_id', request()->user()->organization_id)
            ->with(['account'])
            ->findOrFail($id);

        $this->authorize('view', $category);

        return response()->json(['data' => $category]);
    }

    public function store(StoreExpenseCategoryRequest $request)
    {
        $this->authorize('create', ExpenseCategory::class);

        $validated = $request->validated();
        $user = $request->user();

        $category = ExpenseCategory::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'account_id' => $validated['account_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $category->load('account')], 201);
    }

    public function update(UpdateExpenseCategoryRequest $request, string $id)
    {
        $category = ExpenseCategory::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $category);

        $validated = $request->validated();

        $category->update($validated);

        return response()->json(['data' => $category->load('account')]);
    }

    public function destroy(string $id)
    {
        $category = ExpenseCategory::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(['message' => 'Expense category deleted']);
    }
}
