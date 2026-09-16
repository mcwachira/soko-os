<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PriceOverride;
use App\Models\SaleItem;
use App\Http\Requests\StorePriceOverrideRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PriceOverrideController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', PriceOverride::class);

        $overrides = PriceOverride::where('organization_id', $request->user()->organization_id)
            ->with(['product', 'user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($overrides);
    }

    public function store(StorePriceOverrideRequest $request)
    {
        $this->authorize('create', PriceOverride::class);

        $validated = $request->validated();
        $user = $request->user();

        $saleItem = SaleItem::findOrFail($validated['sale_item_id']);
        $originalPrice = $saleItem->unit_price_minor;

        $override = PriceOverride::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'sale_id' => $validated['sale_id'] ?? null,
            'sale_item_id' => $validated['sale_item_id'],
            'product_id' => $saleItem->product_id,
            'user_id' => $user->id,
            'original_price_minor' => $originalPrice,
            'new_price_minor' => $validated['new_price_minor'],
            'difference_minor' => $validated['new_price_minor'] - $originalPrice,
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['data' => $override->load('product', 'user')], 201);
    }

    public function approve(Request $request, string $id)
    {
        $override = PriceOverride::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('approve', $override);

        if ($override->status !== 'pending') {
            return response()->json(['message' => 'Override is not pending'], 422);
        }

        $override->update([
            'status' => 'approved',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
        ]);

        if ($override->sale_item_id) {
            $saleItem = SaleItem::find($override->sale_item_id);
            if ($saleItem) {
                $saleItem->update(['unit_price_minor' => $override->new_price_minor]);
            }
        }

        return response()->json(['data' => $override->load('product', 'user', 'approver')]);
    }
}
