<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Str;

class CardPaymentProvider implements PaymentProvider
{
    protected ?string $terminalId;

    protected ?string $merchantId;

    protected ?string $apiKey;

    public function __construct(
        ?string $terminalId = null,
        ?string $merchantId = null,
        ?string $apiKey = null
    ) {
        $this->terminalId = $terminalId ?? config('payments.card.terminal_id');
        $this->merchantId = $merchantId ?? config('payments.card.merchant_id');
        $this->apiKey = $apiKey ?? config('payments.card.api_key');
    }

    public function initiatePayment(Sale $sale, array $paymentData): PaymentIntent
    {
        $reference = $paymentData['reference'] ?? 'CARD-'.Str::random(8);

        // In production, this would call the card terminal API
        // For now, we return instructions for the cashier
        return new PaymentIntent(
            paymentMethod: 'card',
            amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
            currency: $paymentData['currency'] ?? 'KES',
            reference: $reference,
            instructions: 'Insert/swipe/tap card on terminal. Reference: '.$reference,
            metadata: [
                'terminal_id' => $this->terminalId,
                'merchant_id' => $this->merchantId,
            ],
        );
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        $success = $payload['status'] === 'approved' || $payload['status'] === 'paid';

        return new PaymentCallbackResult(
            success: $success,
            externalTransactionId: $payload['transaction_id'] ?? $payload['external_transaction_id'] ?? 'CARD-'.Str::random(8),
            status: $success ? 'paid' : 'failed',
            amountMinor: $payload['amount_minor'] ?? 0,
            currency: $payload['currency'] ?? 'KES',
            reference: $payload['reference'] ?? null,
            providerResponse: $payload,
            errorMessage: $success ? null : ($payload['error_message'] ?? 'Card payment failed'),
        );
    }

    public function verifyPayment(string $externalTransactionId): PaymentStatus
    {
        // In production, this would query the card processor API
        return new PaymentStatus(
            status: 'paid',
            amountMinor: 0,
            currency: 'KES',
            externalTransactionId: $externalTransactionId,
        );
    }

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult
    {
        // In production, this would call the card processor refund API
        return new RefundResult(
            success: true,
            externalRefundId: 'CARD-REF-'.Str::random(8),
            status: 'pending', // Card refunds are typically pending
            amountMinor: $amountMinor,
            currency: $payment->currency,
            errorMessage: 'Card refund initiated. Settlement typically takes 3-5 business days.',
        );
    }

    public function getName(): string
    {
        return 'card';
    }

    public function getSupportedMethods(): array
    {
        return ['card'];
    }
}
