<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $payments = Payment::whereHas('sale', function ($query) use ($request) {
            $query->where('organization_id', $request->user()->organization_id);
        })
            ->with(['sale', 'customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($payments);
    }

    public function show(string $id)
    {
        $payment = Payment::whereHas('sale', function ($query) {
            $query->where('organization_id', request()->user()->organization_id);
        })
            ->with(['sale.items', 'sale.customer'])
            ->findOrFail($id);

        $this->authorize('view', $payment);

        return response()->json(['data' => $payment]);
    }
}
