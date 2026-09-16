<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Http\Requests\StoreFiscalYearRequest;
use App\Http\Requests\UpdateFiscalYearRequest;
use Illuminate\Http\Request;
use Illuminate\Support\DB;

class FiscalYearController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', FiscalYear::class);

        $fiscalYears = FiscalYear::where('organization_id', $request->user()->organization_id)
            ->orderBy('start_date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($fiscalYears);
    }

    public function show(string $id)
    {
        $fiscalYear = FiscalYear::where('organization_id', request()->user()->organization_id)
            ->with('accountingPeriods')
            ->findOrFail($id);

        $this->authorize('view', $fiscalYear);

        return response()->json(['data' => $fiscalYear]);
    }

    public function store(StoreFiscalYearRequest $request)
    {
        $this->authorize('create', FiscalYear::class);

        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            if (!empty($validated['is_current'])) {
                FiscalYear::where('organization_id', $user->organization_id)
                    ->update(['is_current' => false]);
            }

            $fiscalYear = FiscalYear::create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'name' => $validated['name'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'is_current' => !empty($validated['is_current']),
            ]);

            return response()->json(['data' => $fiscalYear], 201);
        });
    }

    public function update(UpdateFiscalYearRequest $request, string $id)
    {
        $fiscalYear = FiscalYear::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $fiscalYear);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $fiscalYear) {
            if (!empty($validated['is_current'])) {
                FiscalYear::where('organization_id', $fiscalYear->organization_id)
                    ->where('id', '!=', $fiscalYear->id)
                    ->update(['is_current' => false]);
            }

            $fiscalYear->update($validated);

            return response()->json(['data' => $fiscalYear]);
        });
    }

    public function destroy(string $id)
    {
        $fiscalYear = FiscalYear::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $fiscalYear);

        $fiscalYear->delete();

        return response()->json(['message' => 'Fiscal year deleted']);
    }
}
