<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;

interface PaymentProvider
{
    public function initiatePayment(Sale $sale, array $paymentData): PaymentIntent;

    public function handleCallback(array $payload): PaymentCallbackResult;

    public function verifyPayment(string $externalTransactionId): PaymentStatus;

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult;

    public function getName(): string;

    public function getSupportedMethods(): array;
}
