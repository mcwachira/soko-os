<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Str;

class CashPaymentProvider implements PaymentProvider
{
    public function initiatePayment(Sale $sale, array $paymentData): PaymentIntent
    {
        return new PaymentIntent(
            paymentMethod: 'cash',
            amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
            currency: $paymentData['currency'] ?? 'KES',
            reference: $paymentData['reference'] ?? 'CASH-'.Str::random(8),
            instructions: 'Pay cash to cashier',
        );
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        return new PaymentCallbackResult(
            success: true,
            externalTransactionId: $payload['external_transaction_id'] ?? 'CASH-'.Str::random(8),
            status: 'paid',
            amountMinor: $payload['amount_minor'] ?? 0,
            currency: $payload['currency'] ?? 'KES',
            reference: $payload['reference'] ?? null,
            providerResponse: $payload,
        );
    }

    public function verifyPayment(string $externalTransactionId): PaymentStatus
    {
        return new PaymentStatus(
            status: 'paid',
            amountMinor: 0,
            currency: 'KES',
            externalTransactionId: $externalTransactionId,
        );
    }

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult
    {
        return new RefundResult(
            success: true,
            externalRefundId: 'CASH-REF-'.Str::random(8),
            status: 'completed',
            amountMinor: $amountMinor,
            currency: $payment->currency,
        );
    }

    public function getName(): string
    {
        return 'cash';
    }

    public function getSupportedMethods(): array
    {
        return ['cash'];
    }
}
