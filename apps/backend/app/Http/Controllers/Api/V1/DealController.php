<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\DealStage;
use App\Http\Requests\StoreDealRequest;
use App\Http\Requests\UpdateDealRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Deal::class);

        $query = Deal::where('organization_id', $request->user()->organization_id)
            ->with(['account', 'contact', 'pipeline', 'stage', 'owner', 'lead']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('deal_name', 'ilike', "%{$search}%")
                    ->orWhereHas('account', fn($q2) => $q2->where('legal_name', 'ilike', "%{$search}%"))
                    ->orWhereHas('contact', fn($q2) => $q2->where('first_name', 'ilike', "%{$search}%"));
            });
        }

        if ($request->has('pipeline_id')) {
            $query->where('pipeline_id', $request->pipeline_id);
        }

        if ($request->has('stage_id')) {
            $query->where('stage_id', $request->stage_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('owner_id')) {
            $query->where('owner_user_id', $request->owner_id);
        }

        $deals = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($deals);
    }

    public function show(string $id)
    {
        $deal = Deal::where('organization_id', request()->user()->organization_id)
            ->with(['account', 'contact', 'pipeline', 'stage', 'owner', 'lead', 'products', 'payments', 'activities'])
            ->findOrFail($id);

        $this->authorize('view', $deal);

        return response()->json(['data' => $deal]);
    }

    public function store(StoreDealRequest $request)
    {
        $this->authorize('create', Deal::class);

        $user = $request->user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            $stage = \App\Models\DealStage::findOrFail($validated['stage_id']);

            $deal = Deal::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $validated['business_id'] ?? $user->business_id,
                'account_id' => $validated['account_id'] ?? null,
                'contact_id' => $validated['contact_id'] ?? null,
                'pipeline_id' => $validated['pipeline_id'],
                'stage_id' => $stage->id,
                'owner_user_id' => $validated['owner_user_id'] ?? $user->id,
                'lead_id' => $validated['lead_id'] ?? null,
                'deal_name' => $validated['deal_name'],
                'description' => $validated['description'] ?? null,
                'currency' => $validated['currency'] ?? 'KES',
                'value_minor' => $validated['value_minor'] ?? 0,
                'probability_minor' => $stage->probability_percentage * 100,
                'expected_close_date' => $validated['expected_close_date'] ?? null,
                'status' => 'open',
                'competitors' => $validated['competitors'] ?? null,
                'source_campaign' => $validated['source_campaign'] ?? null,
                'custom_fields' => $validated['custom_fields'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'stage_entered_at' => now(),
            ]);

            if (isset($validated['products']) && is_array($validated['products'])) {
                foreach ($validated['products'] as $product) {
                    \App\Models\DealProduct::create([
                        'id' => Str::uuid()->toString(),
                        'deal_id' => $deal->id,
                        'product_id' => $product['product_id'] ?? null,
                        'product_name' => $product['product_name'] ?? null,
                        'sku' => $product['sku'] ?? null,
                        'quantity' => $product['quantity'] ?? 1,
                        'unit_price_minor' => $product['unit_price_minor'] ?? 0,
                        'discount_minor' => $product['discount_minor'] ?? 0,
                        'subtotal_minor' => ($product['quantity'] ?? 1) * ($product['unit_price_minor'] ?? 0) - ($product['discount_minor'] ?? 0),
                    ]);
                }
            }

            return response()->json(['data' => $deal->load('account', 'contact', 'pipeline', 'stage', 'owner', 'products')], 201);
        });
    }

    public function update(UpdateDealRequest $request, string $id)
    {
        $deal = Deal::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $deal);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $deal) {
            $oldStageId = $deal->stage_id;

            $deal->update([
                'account_id' => $validated['account_id'] ?? $deal->account_id,
                'contact_id' => $validated['contact_id'] ?? $deal->contact_id,
                'pipeline_id' => $validated['pipeline_id'] ?? $deal->pipeline_id,
                'stage_id' => $validated['stage_id'] ?? $deal->stage_id,
                'owner_user_id' => $validated['owner_user_id'] ?? $deal->owner_user_id,
                'deal_name' => $validated['deal_name'] ?? $deal->deal_name,
                'description' => $validated['description'] ?? $deal->description,
                'currency' => $validated['currency'] ?? $deal->currency,
                'value_minor' => $validated['value_minor'] ?? $deal->value_minor,
                'probability_minor' => $validated['probability_minor'] ?? $deal->probability_minor,
                'expected_close_date' => $validated['expected_close_date'] ?? $deal->expected_close_date,
                'status' => $validated['status'] ?? $deal->status,
                'lost_reason' => $validated['lost_reason'] ?? $deal->lost_reason,
                'competitors' => $validated['competitors'] ?? $deal->competitors,
                'source_campaign' => $validated['source_campaign'] ?? $deal->source_campaign,
                'custom_fields' => $validated['custom_fields'] ?? $deal->custom_fields,
                'metadata' => $validated['metadata'] ?? $deal->metadata,
                'notes' => $validated['notes'] ?? $deal->notes,
            ]);

            // Stage change tracking
            if ($validated['stage_id'] && $validated['stage_id'] !== $oldStageId) {
                $deal->update([
                    'stage_exited_at' => now(),
                    'stage_entered_at' => now(),
                ]);
            }

            return response()->json(['data' => $deal->load('account', 'contact', 'pipeline', 'stage', 'owner', 'products')]);
        });
    }

    public function destroy(string $id)
    {
        $deal = Deal::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $deal);

        $deal->delete();

        return response()->json(['message' => 'Deal deleted']);
    }
}
