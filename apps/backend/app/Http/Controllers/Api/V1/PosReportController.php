<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\CashShift;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PosReportController extends Controller
{
    public function sales(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $query = Sale::where('organization_id', $request->user()->organization_id)
            ->with(['customer', 'cashier', 'branch', 'terminal']);

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }
        if ($request->has('cashier_id')) {
            $query->where('cashier_user_id', $request->cashier_id);
        }

        $sales = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($sales);
    }

    public function xRead(Request $request)
    {
        $this->authorize('viewAny', CashShift::class);

        $shift = CashShift::where('cashier_user_id', $request->user()->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (! $shift) {
            return response()->json(['message' => 'No open shift'], 404);
        }

        $sales = Sale::where('shift_id', $shift->id)
            ->where('organization_id', $request->user()->organization_id)
            ->get();

        $cashSales = $sales->where('payments.payment_method', 'cash')->sum('paid_total_minor');
        $mpesaSales = $sales->where('payments.payment_method', 'mpesa')->sum('paid_total_minor');
        $cardSales = $sales->where('payments.payment_method', 'card')->sum('paid_total_minor');
        $totalSales = $sales->sum('grand_total_minor');
        $totalDiscount = $sales->sum('discount_minor');
        $totalTax = $sales->sum('tax_total_minor');
        $totalRefunds = 0;

        return response()->json([
            'data' => [
                'shift_id' => $shift->id,
                'opened_at' => $shift->opened_at,
                'cash_sales' => $cashSales,
                'mpesa_sales' => $mpesaSales,
                'card_sales' => $cardSales,
                'total_sales' => $totalSales,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'total_refunds' => $totalRefunds,
                'expected_cash' => $shift->opening_float_minor + $shift->cash_sales_minor + $shift->cash_in_minor - $shift->cash_out_minor - $shift->cash_refunds_minor,
                'transaction_count' => $sales->count(),
            ],
        ]);
    }

    public function zRead(Request $request)
    {
        $this->authorize('viewAny', CashShift::class);

        $shift = CashShift::where('cashier_user_id', $request->user()->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (! $shift) {
            return response()->json(['message' => 'No open shift'], 404);
        }

        $sales = Sale::where('shift_id', $shift->id)
            ->where('organization_id', $request->user()->organization_id)
            ->get();

        $cashSales = $sales->where('payments.payment_method', 'cash')->sum('paid_total_minor');
        $mpesaSales = $sales->where('payments.payment_method', 'mpesa')->sum('paid_total_minor');
        $cardSales = $sales->where('payments.payment_method', 'card')->sum('paid_total_minor');
        $totalSales = $sales->sum('grand_total_minor');
        $totalDiscount = $sales->sum('discount_minor');
        $totalTax = $sales->sum('tax_total_minor');

        return response()->json([
            'data' => [
                'shift_id' => $shift->id,
                'opened_at' => $shift->opened_at,
                'closed_at' => now(),
                'cash_sales' => $cashSales,
                'mpesa_sales' => $mpesaSales,
                'card_sales' => $cardSales,
                'total_sales' => $totalSales,
                'total_discount' => $totalDiscount,
                'total_tax' => $totalTax,
                'opening_float' => $shift->opening_float_minor,
                'expected_cash' => $shift->opening_float_minor + $shift->cash_sales_minor + $shift->cash_in_minor - $shift->cash_out_minor - $shift->cash_refunds_minor,
                'transaction_count' => $sales->count(),
            ],
        ]);
    }

    public function topProducts(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $results = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.organization_id', $request->user()->organization_id)
            ->select('products.id', 'products.name', DB::raw('SUM(sale_items.quantity) as total_quantity'), DB::raw('SUM(sale_items.total_minor) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderBy('total_quantity', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['data' => $results]);
    }
}
