<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyTransaction;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LoyaltyController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', LoyaltyAccount::class);

        $accounts = LoyaltyAccount::where('organization_id', $request->user()->organization_id)
            ->with(['customer'])
            ->paginate($request->integer('per_page', 25));

        return response()->json($accounts);
    }

    public function show(string $id)
    {
        $account = LoyaltyAccount::where('organization_id', request()->user()->organization_id)
            ->with(['customer', 'transactions'])
            ->findOrFail($id);

        $this->authorize('view', $account);

        return response()->json(['data' => $account]);
    }

    public function earn(Request $request, string $customerId)
    {
        $this->authorize('update', LoyaltyAccount::class);

        $customer = Customer::where('organization_id', $request->user()->organization_id)
            ->findOrFail($customerId);

        $saleId = $request->input('sale_id');
        $points = (int) $request->input('points', 0);

        if ($points <= 0) {
            return response()->json(['message' => 'Points must be greater than 0'], 422);
        }

        $account = DB::transaction(function () use ($customer, $points, $saleId) {
            $account = LoyaltyAccount::firstOrCreate(
                ['organization_id' => $customer->organization_id, 'customer_id' => $customer->id],
                ['tier' => 'bronze']
            );

            $account->increment('points_balance', $points);
            $account->increment('total_earned', $points);

            LoyaltyTransaction::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $customer->organization_id,
                'loyalty_account_id' => $account->id,
                'sale_id' => $saleId,
                'transaction_type' => 'earn',
                'points' => $points,
                'description' => 'Points earned from purchase',
            ]);

            return $account;
        });

        return response()->json(['data' => $account->load('customer')]);
    }

    public function redeem(Request $request, string $customerId)
    {
        $this->authorize('update', LoyaltyAccount::class);

        $customer = Customer::where('organization_id', $request->user()->organization_id)
            ->findOrFail($customerId);

        $points = (int) $request->input('points', 0);

        if ($points <= 0) {
            return response()->json(['message' => 'Points must be greater than 0'], 422);
        }

        $account = LoyaltyAccount::where('organization_id', $customer->organization_id)
            ->where('customer_id', $customer->id)
            ->firstOrFail();

        if ($account->points_balance < $points) {
            return response()->json(['message' => 'Insufficient points balance'], 422);
        }

        DB::transaction(function () use ($account, $points) {
            $account->decrement('points_balance', $points);
            $account->increment('total_redeemed', $points);

            LoyaltyTransaction::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $account->organization_id,
                'loyalty_account_id' => $account->id,
                'transaction_type' => 'redeem',
                'points' => -$points,
                'description' => 'Points redeemed',
            ]);
        });

        return response()->json(['data' => $account->load('customer')]);
    }
}
