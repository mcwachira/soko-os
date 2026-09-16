<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Invoice;
use App\Models\Bill;
use App\Models\Expense;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Services\Accounting\JournalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Payment::class);

        $user = $request->user();
        $query = Payment::where('organization_id', $user->organization_id)
            ->with(['sale', 'customer']);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('reference_type')) {
            $query->where('reference_type', $request->reference_type);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($payments);
    }

    public function show(string $id)
    {
        $payment = Payment::where('organization_id', request()->user()->organization_id)
            ->with(['sale.items', 'sale.customer', 'customer', 'allocations.allocatable'])
            ->findOrFail($id);

        $this->authorize('view', $payment);

        return response()->json(['data' => $payment]);
    }

    public function store(StorePaymentRequest $request, JournalService $journalService)
    {
        $this->authorize('create', Payment::class);

        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $user, $journalService) {
            $payment = Payment::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'customer_id' => $validated['customer_id'] ?? null,
                'sale_id' => $validated['sale_id'] ?? null,
                'payment_type' => $validated['payment_type'],
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id' => $validated['reference_id'] ?? null,
                'amount_minor' => $validated['amount_minor'],
                'currency' => $validated['currency'],
                'payment_method' => $validated['payment_method'],
                'reference' => $validated['reference'] ?? null,
                'external_transaction_id' => $validated['external_transaction_id'] ?? null,
                'provider_response' => $validated['provider_response'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
            ]);

            if ($validated['payment_type'] === 'invoice' && $validated['reference_type'] === 'invoice' && $validated['reference_id']) {
                $invoice = Invoice::where('organization_id', $user->organization_id)
                    ->where('id', $validated['reference_id'])
                    ->first();

                if ($invoice) {
                    $invoice->paid_total_minor += $validated['amount_minor'];
                    $invoice->balance_minor = $invoice->grand_total_minor - $invoice->paid_total_minor;
                    $invoice->status = $invoice->balance_minor <= 0 ? 'paid' : 'partial';
                    $invoice->save();

                    $journalService->postPaymentJournal($user->organization_id, $user->business_id, $payment, $invoice);
                }
            } elseif ($validated['payment_type'] === 'bill' && $validated['reference_type'] === 'bill' && $validated['reference_id']) {
                $bill = Bill::where('organization_id', $user->organization_id)
                    ->where('id', $validated['reference_id'])
                    ->first();

                if ($bill) {
                    $bill->paid_total_minor += $validated['amount_minor'];
                    $bill->balance_minor = $bill->grand_total_minor - $bill->paid_total_minor;
                    $bill->status = $bill->balance_minor <= 0 ? 'paid' : 'partial';
                    $bill->save();

                    $journalService->postBillPaymentJournal($user->organization_id, $user->business_id, $payment, $bill);
                }
            } elseif ($validated['payment_type'] === 'expense' && $validated['reference_type'] === 'expense' && $validated['reference_id']) {
                $expense = Expense::where('organization_id', $user->organization_id)
                    ->where('id', $validated['reference_id'])
                    ->first();

                if ($expense) {
                    $expense->update(['status' => 'paid']);

                    $journalService->postExpensePaymentJournal($user->organization_id, $user->business_id, $payment, $expense);
                }
            }

            return response()->json(['data' => $payment->load('sale', 'customer', 'allocations')], 201);
        });
    }

    public function update(UpdatePaymentRequest $request, string $id, JournalService $journalService)
    {
        $payment = Payment::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $payment);

        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $payment, $user, $journalService) {
            $oldReferenceType = $payment->reference_type;
            $oldReferenceId = $payment->reference_id;
            $oldAmount = $payment->amount_minor;

            $payment->update($validated);

            if ($oldReferenceType === 'invoice' && $oldReferenceId) {
                $invoice = Invoice::where('organization_id', $user->organization_id)
                    ->where('id', $oldReferenceId)
                    ->first();

                if ($invoice) {
                    $invoice->paid_total_minor = max(0, $invoice->paid_total_minor - $oldAmount);
                    $invoice->balance_minor = $invoice->grand_total_minor - $invoice->paid_total_minor;
                    $invoice->status = $invoice->balance_minor <= 0 ? 'paid' : ($invoice->balance_minor < $invoice->grand_total_minor ? 'partial' : 'sent');
                    $invoice->save();
                }
            } elseif ($oldReferenceType === 'bill' && $oldReferenceId) {
                $bill = Bill::where('organization_id', $user->organization_id)
                    ->where('id', $oldReferenceId)
                    ->first();

                if ($bill) {
                    $bill->paid_total_minor = max(0, $bill->paid_total_minor - $oldAmount);
                    $bill->balance_minor = $bill->grand_total_minor - $bill->paid_total_minor;
                    $bill->status = $bill->balance_minor <= 0 ? 'paid' : ($bill->balance_minor < $bill->grand_total_minor ? 'partial' : 'pending');
                    $bill->save();
                }
            } elseif ($oldReferenceType === 'expense' && $oldReferenceId) {
                $expense = Expense::where('organization_id', $user->organization_id)
                    ->where('id', $oldReferenceId)
                    ->first();

                if ($expense) {
                    $expense->update(['status' => 'approved']);
                }
            }

            if ($validated['reference_type'] ?? $oldReferenceType === 'invoice' && ($validated['reference_id'] ?? $oldReferenceId)) {
                $newReferenceType = $validated['reference_type'] ?? $oldReferenceType;
                $newReferenceId = $validated['reference_id'] ?? $oldReferenceId;

                if ($newReferenceType === 'invoice' && $newReferenceId) {
                    $invoice = Invoice::where('organization_id', $user->organization_id)
                        ->where('id', $newReferenceId)
                        ->first();

                    if ($invoice) {
                        $newAmount = $validated['amount_minor'] ?? $oldAmount;
                        $invoice->paid_total_minor += $newAmount;
                        $invoice->balance_minor = $invoice->grand_total_minor - $invoice->paid_total_minor;
                        $invoice->status = $invoice->balance_minor <= 0 ? 'paid' : ($invoice->balance_minor < $invoice->grand_total_minor ? 'partial' : 'sent');
                        $invoice->save();

                        $journalService->postPaymentJournal($user->organization_id, $user->business_id, $payment, $invoice);
                    }
                } elseif ($newReferenceType === 'bill' && $newReferenceId) {
                    $bill = Bill::where('organization_id', $user->organization_id)
                        ->where('id', $newReferenceId)
                        ->first();

                    if ($bill) {
                        $newAmount = $validated['amount_minor'] ?? $oldAmount;
                        $bill->paid_total_minor += $newAmount;
                        $bill->balance_minor = $bill->grand_total_minor - $bill->paid_total_minor;
                        $bill->status = $bill->balance_minor <= 0 ? 'paid' : ($bill->balance_minor < $bill->grand_total_minor ? 'partial' : 'pending');
                        $bill->save();

                        $journalService->postBillPaymentJournal($user->organization_id, $user->business_id, $payment, $bill);
                    }
                } elseif ($newReferenceType === 'expense' && $newReferenceId) {
                    $expense = Expense::where('organization_id', $user->organization_id)
                        ->where('id', $newReferenceId)
                        ->first();

                    if ($expense) {
                        $expense->update(['status' => 'paid']);
                        $journalService->postExpensePaymentJournal($user->organization_id, $user->business_id, $payment, $expense);
                    }
                }
            }

            return response()->json(['data' => $payment->load('sale', 'customer', 'allocations')]);
        });
    }

    public function destroy(string $id)
    {
        $payment = Payment::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $payment);

        return DB::transaction(function () use ($payment) {
            $payment->delete();

            return response()->json(['message' => 'Payment deleted']);
        });
    }
}

