<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = Plan::active()
            ->orderBy('price_minor')
            ->paginate($request->integer('per_page', 50));

        return response()->json($plans);
    }

    public function show(string $id)
    {
        $plan = Plan::with('products')->findOrFail($id);

        return response()->json(['data' => $plan]);
    }
}
