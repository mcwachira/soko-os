<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Activity::class);

        $query = Activity::where('organization_id', $request->user()->organization_id)
            ->with(['user', 'business']);

        if ($request->has('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $activities = $query->orderBy('due_date', 'asc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($activities);
    }

    public function show(string $id)
    {
        $activity = Activity::where('organization_id', request()->user()->organization_id)
            ->with(['user', 'business', 'links'])
            ->findOrFail($id);

        $this->authorize('view', $activity);

        return response()->json(['data' => $activity]);
    }

    public function store(StoreActivityRequest $request)
    {
        $this->authorize('create', Activity::class);

        $user = $request->user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            $activity = Activity::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $validated['business_id'] ?? $user->business_id,
                'user_id' => $validated['user_id'] ?? $user->id,
                'activity_type' => $validated['activity_type'] ?? 'note',
                'subject' => $validated['subject'] ?? null,
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? 'pending',
                'priority' => $validated['priority'] ?? 'medium',
                'due_date' => $validated['due_date'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
            ]);

            if (isset($validated['links']) && is_array($validated['links'])) {
                foreach ($validated['links'] as $link) {
                    \App\Models\ActivityLink::create([
                        'id' => Str::uuid()->toString(),
                        'activity_id' => $activity->id,
                        'linkable_type' => $link['linkable_type'],
                        'linkable_id' => $link['linkable_id'],
                    ]);
                }
            }

            return response()->json(['data' => $activity->load('user', 'links')], 201);
        });
    }

    public function update(UpdateActivityRequest $request, string $id)
    {
        $activity = Activity::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $activity);

        $validated = $request->validated();

        $activity->update($validated);

        return response()->json(['data' => $activity->load('user', 'links')]);
    }

    public function destroy(string $id)
    {
        $activity = Activity::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $activity);

        $activity->delete();

        return response()->json(['message' => 'Activity deleted']);
    }
}
