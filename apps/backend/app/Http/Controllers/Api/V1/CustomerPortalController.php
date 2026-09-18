<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerPortalController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (! $customer || ! Hash::check($request->password, $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $token = $customer->createToken('customer-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'customer' => $customer,
        ]);
    }

    public function invoices(Request $request)
    {
        $customer = $request->user();

        $this->authorize('view', $customer);

        $invoices = Invoice::where('organization_id', $customer->organization_id)
            ->where('customer_id', $customer->id)
            ->with(['customer'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($invoices);
    }

    public function showInvoice(Request $request, string $id)
    {
        $customer = $request->user();

        $invoice = Invoice::where('organization_id', $customer->organization_id)
            ->where('customer_id', $customer->id)
            ->with(['customer', 'items'])
            ->findOrFail($id);

        return response()->json(['data' => $invoice]);
    }
}
