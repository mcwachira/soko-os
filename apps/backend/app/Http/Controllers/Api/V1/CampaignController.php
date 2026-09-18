<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Campaign::class);

        $campaigns = Campaign::where('organization_id', $request->user()->organization_id)
            ->with(['business'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($campaigns);
    }

    public function show(string $id)
    {
        $campaign = Campaign::where('organization_id', request()->user()->organization_id)
            ->with(['business'])
            ->findOrFail($id);

        $this->authorize('view', $campaign);

        return response()->json(['data' => $campaign]);
    }

    public function store(StoreCampaignRequest $request)
    {
        $this->authorize('create', Campaign::class);

        $user = $request->user();
        $validated = $request->validated();

        $campaign = Campaign::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'marketing',
            'status' => $validated['status'] ?? 'draft',
            'channel' => $validated['channel'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'budget_minor' => $validated['budget_minor'] ?? 0,
            'currency' => $validated['currency'] ?? 'KES',
            'utm_parameters' => $validated['utm_parameters'] ?? null,
            'target_audience' => $validated['target_audience'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json(['data' => $campaign->load('business')], 201);
    }

    public function update(UpdateCampaignRequest $request, string $id)
    {
        $campaign = Campaign::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $campaign);

        $validated = $request->validated();

        $campaign->update($validated);

        return response()->json(['data' => $campaign->load('business')]);
    }

    public function destroy(string $id)
    {
        $campaign = Campaign::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $campaign);

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted']);
    }
}
