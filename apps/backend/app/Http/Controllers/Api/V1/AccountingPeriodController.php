<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use App\Http\Requests\StoreAccountingPeriodRequest;
use App\Http\Requests\UpdateAccountingPeriodRequest;
use Illuminate\Http\Request;
use Illuminate\Support\DB;

class AccountingPeriodController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountingPeriod::class);

        $query = AccountingPeriod::where('organization_id', $request->user()->organization_id)
            ->with('fiscalYear');

        if ($request->has('fiscal_year_id')) {
            $query->where('fiscal_year_id', $request->fiscal_year_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $periods = $query->orderBy('start_date', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($periods);
    }

    public function show(string $id)
    {
        $period = AccountingPeriod::where('organization_id', request()->user()->organization_id)
            ->with('fiscalYear', 'closedBy')
            ->findOrFail($id);

        $this->authorize('view', $period);

        return response()->json(['data' => $period]);
    }

    public function store(StoreAccountingPeriodRequest $request)
    {
        $this->authorize('create', AccountingPeriod::class);

        $validated = $request->validated();
        $user = $request->user();

        $period = AccountingPeriod::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'fiscal_year_id' => $validated['fiscal_year_id'],
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'] ?? 'open',
        ]);

        return response()->json(['data' => $period->load('fiscalYear')], 201);
    }

    public function update(UpdateAccountingPeriodRequest $request, string $id)
    {
        $period = AccountingPeriod::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $period);

        $validated = $request->validated();

        if (isset($validated['status']) && $validated['status'] === 'closed' && !$period->closed_at) {
            $validated['closed_at'] = now();
            $validated['closed_by_user_id'] = $request->user()->id;
        }

        $period->update($validated);

        return response()->json(['data' => $period->load('fiscalYear')]);
    }

    public function destroy(string $id)
    {
        $period = AccountingPeriod::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $period);

        $period->delete();

        return response()->json(['message' => 'Accounting period deleted']);
    }
}
