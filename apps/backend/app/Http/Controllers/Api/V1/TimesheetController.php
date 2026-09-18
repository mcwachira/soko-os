<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Timesheet;
use App\Http\Requests\StoreTimesheetRequest;
use App\Http\Requests\UpdateTimesheetRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Timesheet::class);

        $query = Timesheet::where('organization_id', $request->user()->organization_id)
            ->with(['project', 'task', 'user']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $timesheets = $query->orderBy('date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($timesheets);
    }

    public function show(string $id)
    {
        $timesheet = Timesheet::where('organization_id', request()->user()->organization_id)
            ->with(['project', 'task', 'user'])
            ->findOrFail($id);

        $this->authorize('view', $timesheet);

        return response()->json(['data' => $timesheet]);
    }

    public function store(StoreTimesheetRequest $request)
    {
        $this->authorize('create', Timesheet::class);

        $validated = $request->validated();
        $user = $request->user();

        $timesheet = Timesheet::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'user_id' => $user->id,
            'date' => $validated['date'],
            'hours' => $validated['hours'],
            'is_billable' => $validated['is_billable'] ?? true,
            'rate_minor' => $validated['rate_minor'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'status' => 'draft',
        ]);

        return response()->json(['data' => $timesheet->load('project', 'task', 'user')], 201);
    }

    public function update(UpdateTimesheetRequest $request, string $id)
    {
        $timesheet = Timesheet::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $timesheet);

        $timesheet->update($request->validated());

        return response()->json(['data' => $timesheet->load('project', 'task', 'user')]);
    }

    public function destroy(string $id)
    {
        $timesheet = Timesheet::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $timesheet);

        $timesheet->delete();

        return response()->json(['message' => 'Timesheet deleted']);
    }
}
