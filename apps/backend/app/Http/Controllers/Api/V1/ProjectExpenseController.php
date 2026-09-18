<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProjectExpense;
use App\Http\Requests\StoreProjectExpenseRequest;
use App\Http\Requests\UpdateProjectExpenseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectExpenseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProjectExpense::class);

        $query = ProjectExpense::where('organization_id', $request->user()->organization_id)
            ->with(['project', 'task']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $expenses = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($expenses);
    }

    public function show(string $id)
    {
        $expense = ProjectExpense::where('organization_id', request()->user()->organization_id)
            ->with(['project', 'task'])
            ->findOrFail($id);

        $this->authorize('view', $expense);

        return response()->json(['data' => $expense]);
    }

    public function store(StoreProjectExpenseRequest $request)
    {
        $this->authorize('create', ProjectExpense::class);

        $validated = $request->validated();
        $user = $request->user();

        $expense = ProjectExpense::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'amount_minor' => $validated['amount_minor'],
            'currency' => $validated['currency'],
            'is_billable' => $validated['is_billable'] ?? false,
            'receipt_path' => $validated['receipt_path'] ?? null,
            'status' => 'draft',
        ]);

        return response()->json(['data' => $expense->load('project', 'task')], 201);
    }

    public function update(UpdateProjectExpenseRequest $request, string $id)
    {
        $expense = ProjectExpense::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $expense);

        $expense->update($request->validated());

        return response()->json(['data' => $expense->load('project', 'task')]);
    }

    public function destroy(string $id)
    {
        $expense = ProjectExpense::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $expense);

        $expense->delete();

        return response()->json(['message' => 'Project expense deleted']);
    }
}
