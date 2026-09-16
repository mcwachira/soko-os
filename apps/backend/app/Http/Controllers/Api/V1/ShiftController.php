<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CloseShiftRequest;
use App\Http\Requests\OpenShiftRequest;
use App\Models\CashShift;
use App\Models\Terminal;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShiftController extends Controller
{
    /**
     * GET /api/v1/shifts/current
     * Get the current open shift for the authenticated user
     */
    public function current()
    {
        $this->authorize('viewAny', CashShift::class);

        $user = request()->user();

        $shift = CashShift::where('cashier_user_id', $user->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        return response()->json(['data' => $shift]);
    }

    /**
     * POST /api/v1/shifts/open
     * Open a new cash shift
     */
    public function open(OpenShiftRequest $request)
    {
        $this->authorize('create', CashShift::class);

        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            // Check if user already has an open shift
            $existingShift = CashShift::where('cashier_user_id', $user->id)
                ->where('status', 'open')
                ->first();

            if ($existingShift) {
                return response()->json([
                    'message' => 'User already has an open shift',
                    'data' => $existingShift,
                ], 409);
            }

            // Validate terminal
            $terminal = Terminal::where('id', $validated['terminal_id'])
                ->where('organization_id', $user->organization_id)
                ->where('is_active', true)
                ->first();

            if (! $terminal) {
                return response()->json(['message' => 'Invalid terminal'], 422);
            }

            $shift = CashShift::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $user->business_id ?? $user->organization_id,
                'branch_id' => $terminal->branch_id,
                'terminal_id' => $terminal->id,
                'cashier_user_id' => $user->id,
                'status' => 'open',
                'opened_at' => now(),
                'opening_float_minor' => $validated['opening_float_minor'],
                'notes' => $validated['notes'] ?? null,
            ]);

            Log::info('Cash shift opened', [
                'shift_id' => $shift->id,
                'user_id' => $user->id,
                'terminal_id' => $terminal->id,
                'opening_float' => $validated['opening_float_minor'],
            ]);

            return response()->json(['data' => $shift->load('terminal.branch')], 201);
        });
    }

    /**
     * POST /api/v1/shifts/close
     * Close the current cash shift
     */
    public function close(CloseShiftRequest $request)
    {
        $this->authorize('create', CashShift::class);

        $validated = $request->validated();
        $user = request()->user();

        return DB::transaction(function () use ($validated, $user) {
            $shift = CashShift::where('cashier_user_id', $user->id)
                ->where('status', 'open')
                ->latest('opened_at')
                ->first();

            if (! $shift) {
                return response()->json(['message' => 'No open shift found'], 404);
            }

            // Calculate expected cash
            $expectedCash = $shift->opening_float_minor + $shift->cash_sales_minor + $shift->cash_in_minor - $shift->cash_out_minor - $shift->cash_refunds_minor;
            $variance = $validated['actual_cash_minor'] - $expectedCash;

            $shift->update([
                'status' => 'closed',
                'closed_at' => now(),
                'actual_cash_minor' => $validated['actual_cash_minor'],
                'expected_cash_minor' => $expectedCash,
                'variance_minor' => $variance,
                'notes' => $validated['notes'] ?? $shift->notes,
            ]);

            Log::info('Cash shift closed', [
                'shift_id' => $shift->id,
                'user_id' => $user->id,
                'expected_cash' => $expectedCash,
                'actual_cash' => $validated['actual_cash_minor'],
                'variance' => $variance,
            ]);

            return response()->json(['data' => $shift->load('terminal.branch')]);
        });
    }
}
