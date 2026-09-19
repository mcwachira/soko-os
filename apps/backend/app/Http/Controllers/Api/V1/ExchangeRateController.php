<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Http\Requests\StoreExchangeRateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExchangeRateController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ExchangeRate::class);

        $query = ExchangeRate::where('organization_id', $request->user()->organization_id)
            ->with('currency');

        if ($request->has('currency_id')) {
            $query->where('currency_id', $request->currency_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('effective_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('effective_date', '<=', $request->to_date);
        }

        $rates = $query->orderBy('effective_date', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($rates);
    }

    public function store(StoreExchangeRateRequest $request)
    {
        $this->authorize('create', ExchangeRate::class);

        $validated = $request->validated();
        $user = $request->user();

        $rate = DB::transaction(function () use ($validated, $user) {
            return ExchangeRate::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'currency_id' => $validated['currency_id'],
                'effective_date' => $validated['effective_date'],
                'rate' => $validated['rate'],
                'source' => $validated['source'] ?? 'manual',
            ]);
        });

        return response()->json(['data' => $rate->load('currency')], 201);
    }
}
