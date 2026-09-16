<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Sale;
use App\Models\InventoryMovement;
use App\Models\TaxSubmission;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $query = Sale::where('organization_id', $request->user()->organization_id)
            ->with(['items', 'payments', 'branch']);

        if ($validated['from'] ?? null) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if ($validated['to'] ?? null) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $sales = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($sales);
    }

    public function inventory(Request $request)
    {
        $this->authorize('viewAny', InventoryMovement::class);

        $movements = InventoryMovement::where('organization_id', $request->user()->organization_id)
            ->with(['product', 'warehouse.branch'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($movements);
    }

    public function tax(Request $request)
    {
        $this->authorize('viewAny', TaxSubmission::class);

        $submissions = TaxSubmission::where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($submissions);
    }
}
