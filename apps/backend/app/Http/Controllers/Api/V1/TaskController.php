<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Task::class);

        $query = Task::where('organization_id', $request->user()->organization_id)
            ->with(['project', 'assignedTo']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($tasks);
    }

    public function show(string $id)
    {
        $task = Task::where('organization_id', request()->user()->organization_id)
            ->with(['project', 'assignedTo', 'timesheets'])
            ->findOrFail($id);

        $this->authorize('view', $task);

        return response()->json(['data' => $task]);
    }

    public function store(StoreTaskRequest $request)
    {
        $this->authorize('create', Task::class);

        $validated = $request->validated();
        $user = $request->user();

        $task = Task::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'project_id' => $validated['project_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'estimated_minor' => $validated['estimated_minor'] ?? 0,
            'actual_minor' => 0,
        ]);

        return response()->json(['data' => $task->load('project', 'assignedTo')], 201);
    }

    public function update(UpdateTaskRequest $request, string $id)
    {
        $task = Task::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $task);

        $task->update($request->validated());

        return response()->json(['data' => $task->load('project', 'assignedTo')]);
    }

    public function destroy(string $id)
    {
        $task = Task::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}
