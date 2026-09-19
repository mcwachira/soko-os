<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::where('organization_id', $request->user()->organization_id)
            ->with(['customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($projects);
    }

    public function show(string $id)
    {
        $project = Project::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'tasks', 'timesheets', 'expenses'])
            ->findOrFail($id);

        $this->authorize('view', $project);

        return response()->json(['data' => $project]);
    }

    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);

        $validated = $request->validated();
        $user = $request->user();

        $project = Project::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'customer_id' => $validated['customer_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'budget_minor' => $validated['budget_minor'] ?? 0,
        ]);

        return response()->json(['data' => $project->load('customer')], 201);
    }

    public function update(UpdateProjectRequest $request, string $id)
    {
        $project = Project::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json(['data' => $project->load('customer')]);
    }

    public function destroy(string $id)
    {
        $project = Project::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(['message' => 'Project deleted']);
    }
}
