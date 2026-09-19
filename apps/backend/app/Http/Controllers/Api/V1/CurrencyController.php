<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CurrencyController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Currency::class);

        $currencies = Currency::where('organization_id', $request->user()->organization_id)
            ->orderBy('code')
            ->paginate($request->integer('per_page', 50));

        return response()->json($currencies);
    }

    public function show(string $id)
    {
        $currency = Currency::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $currency);

        return response()->json(['data' => $currency]);
    }

    public function store(StoreCurrencyRequest $request)
    {
        $this->authorize('create', Currency::class);

        $validated = $request->validated();
        $user = $request->user();

        DB::transaction(function () use ($validated, $user, &$currency) {
            if ($validated['is_base'] ?? false) {
                Currency::where('organization_id', $user->organization_id)
                    ->where('is_base', true)
                    ->update(['is_base' => false]);
            }

            $currency = Currency::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'code' => $validated['code'],
                'name' => $validated['name'],
                'symbol' => $validated['symbol'] ?? null,
                'decimal_places' => $validated['decimal_places'] ?? 2,
                'is_base' => $validated['is_base'] ?? false,
                'is_active' => true,
            ]);
        });

        return response()->json(['data' => $currency], 201);
    }

    public function update(UpdateCurrencyRequest $request, string $id)
    {
        $currency = Currency::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $currency);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $currency) {
            if ($validated['is_base'] ?? false) {
                Currency::where('organization_id', $currency->organization_id)
                    ->where('id', '!=', $currency->id)
                    ->where('is_base', true)
                    ->update(['is_base' => false]);
            }

            $currency->update($validated);
        });

        return response()->json(['data' => $currency]);
    }

    public function destroy(string $id)
    {
        $currency = Currency::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $currency);

        if ($currency->is_base) {
            return response()->json(['message' => 'Cannot delete base currency'], 422);
        }

        $currency->delete();

        return response()->json(['message' => 'Currency deleted']);
    }
}
