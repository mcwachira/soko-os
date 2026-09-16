<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Str;

class BankPaymentProvider implements PaymentProvider
{
    protected ?string $bankCode;

    protected ?string $accountNumber;

    protected ?string $accountName;

    protected ?string $referencePrefix;

    public function __construct(
        ?string $bankCode = null,
        ?string $accountNumber = null,
        ?string $accountName = null,
        ?string $referencePrefix = null
    ) {
        $this->bankCode = $bankCode ?? config('payments.bank.bank_code');
        $this->accountNumber = $accountNumber ?? config('payments.bank.account_number');
        $this->accountName = $accountName ?? config('payments.bank.account_name');
        $this->referencePrefix = $referencePrefix ?? config('payments.bank.reference_prefix', 'BANK');
    }

    public function initiatePayment(Sale $sale, array $paymentData): PaymentIntent
    {
        $reference = $paymentData['reference'] ?? $this->referencePrefix.'-'.Str::random(8);

        return new PaymentIntent(
            paymentMethod: 'bank',
            amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
            currency: 'KES',
            reference: $reference,
            instructions: 'Bank transfer to:
Account: '.$this->accountName.'
Number: '.$this->accountNumber.'
Bank: '.$this->bankCode.'
Reference: '.$reference,
            metadata: [
                'bank_code' => $this->bankCode,
                'account_number' => $this->accountNumber,
                'account_name' => $this->accountName,
            ],
        );
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        $success = $payload['status'] === 'completed' || $payload['status'] === 'paid';

        return new PaymentCallbackResult(
            success: $success,
            externalTransactionId: $payload['transaction_id'] ?? $payload['external_transaction_id'] ?? 'BANK-'.Str::random(8),
            status: $success ? 'paid' : 'failed',
            amountMinor: $payload['amount_minor'] ?? 0,
            currency: $payload['currency'] ?? 'KES',
            reference: $payload['reference'] ?? null,
            providerResponse: $payload,
            errorMessage: $success ? null : ($payload['error_message'] ?? 'Bank payment failed'),
        );
    }

    public function verifyPayment(string $externalTransactionId): PaymentStatus
    {
        // In production, this would query the bank API or check bank statement
        return new PaymentStatus(
            status: 'pending', // Bank transfers typically require manual verification
            amountMinor: 0,
            currency: 'KES',
            externalTransactionId: $externalTransactionId,
        );
    }

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult
    {
        // Bank refunds typically require manual processing
        return new RefundResult(
            success: true,
            externalRefundId: 'BANK-REF-'.Str::random(8),
            status: 'pending',
            amountMinor: $amountMinor,
            currency: $payment->currency,
            errorMessage: 'Bank refund initiated. Manual processing required.',
        );
    }

    public function getName(): string
    {
        return 'bank';
    }

    public function getSupportedMethods(): array
    {
        return ['bank'];
    }
}
