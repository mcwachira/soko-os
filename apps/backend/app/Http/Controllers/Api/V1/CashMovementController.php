<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CashMovement;
use App\Http\Requests\StoreCashMovementRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CashMovementController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CashMovement::class);

        $movements = CashMovement::where('organization_id', $request->user()->organization_id)
            ->with(['branch', 'terminal', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($movements);
    }

    public function store(StoreCashMovementRequest $request)
    {
        $this->authorize('create', CashMovement::class);

        $validated = $request->validated();
        $user = $request->user();

        $movement = DB::transaction(function () use ($validated, $user) {
            $movement = CashMovement::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id,
                'branch_id' => $validated['branch_id'],
                'terminal_id' => $validated['terminal_id'] ?? null,
                'shift_id' => $validated['shift_id'] ?? null,
                'user_id' => $user->id,
                'movement_type' => $validated['movement_type'],
                'amount_minor' => $validated['amount_minor'],
                'currency' => $validated['currency'] ?? 'KES',
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if ($movement->shift_id && in_array($movement->movement_type, ['cash_in', 'cash_out', 'safe_drop'])) {
                $shift = \App\Models\CashShift::find($movement->shift_id);
                if ($shift) {
                    switch ($movement->movement_type) {
                        case 'cash_in':
                            $shift->increment('cash_in_minor', $movement->amount_minor);
                            $shift->increment('expected_cash_minor', $movement->amount_minor);
                            break;
                        case 'cash_out':
                            $shift->increment('cash_out_minor', $movement->amount_minor);
                            $shift->decrement('expected_cash_minor', $movement->amount_minor);
                            break;
                        case 'safe_drop':
                            $shift->decrement('expected_cash_minor', $movement->amount_minor);
                            break;
                    }
                }
            }

            return $movement;
        });

        return response()->json(['data' => $movement->load('branch', 'terminal', 'user')], 201);
    }
}
