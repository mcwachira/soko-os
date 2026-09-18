<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Sale;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controller;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $organizationId = $user->organization_id;
        $businessId = $user->business_id;

        $stats = [
            'total_sales' => Sale::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->sum('grand_total_minor'),
            'total_revenue' => JournalLine::where('journal_entries.organization_id', $organizationId)
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->when($businessId, fn($q) => $q->where('journal_entries.business_id', $businessId))
                ->where('journal_entries.status', 'posted')
                ->whereHas('account', fn($q) => $q->where('type', 'revenue'))
                ->sum('journal_lines.credit_minor'),
            'total_customers' => Customer::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->count(),
            'total_products' => Product::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->count(),
            'outstanding_invoices' => Invoice::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->whereIn('status', ['sent', 'partially_paid', 'overdue'])
                ->sum('balance_minor'),
            'outstanding_bills' => Bill::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->whereIn('status', ['approved', 'partially_paid', 'overdue'])
                ->sum('balance_minor'),
            'recent_sales' => Sale::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->with(['customer', 'branch'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'recent_invoices' => Invoice::where('organization_id', $organizationId)
                ->when($businessId, fn($q) => $q->where('business_id', $businessId))
                ->with(['customer'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json(['data' => $stats]);
    }
}
