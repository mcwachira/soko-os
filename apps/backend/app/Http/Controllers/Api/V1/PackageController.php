<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = Package::where('organization_id', $user->organization_id);
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'sale_id' => 'nullable|uuid|exists:sales,id',
            'sales_order_id' => 'nullable|uuid|exists:sales_orders,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'weight' => 'nullable|numeric',
            'dimensions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $package = Package::create([
            'organization_id' => $user->organization_id,
            'business_id' => $request->business_id ?? $user->business_id,
            'sale_id' => $validated['sale_id'] ?? null,
            'sales_order_id' => $validated['sales_order_id'] ?? null,
            'warehouse_id' => $validated['warehouse_id'],
            'package_number' => Package::generatePackageNumber(),
            'status' => 'pending',
            'weight' => $validated['weight'] ?? null,
            'dimensions' => $validated['dimensions'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($package, 201);
    }

    public function show(Package $package, User $user)
    {
        $this->authorize('view', $package);
        return response()->json($package->load('items'));
    }

    public function destroy(Package $package, User $user)
    {
        $this->authorize('delete', $package);
        $package->delete();
        return response()->json(null, 204);
    }
}
