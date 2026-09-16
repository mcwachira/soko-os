<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Facades\Log;

class PaymentProviderManager
{
    protected array $providers = [];

    public function __construct()
    {
        $this->registerProvider(new CashPaymentProvider);
        $this->registerProvider(new CardPaymentProvider);
        $this->registerProvider(new MpesaPaymentProvider);
        $this->registerProvider(new BankPaymentProvider);
    }

    public function registerProvider(PaymentProvider $provider): void
    {
        foreach ($provider->getSupportedMethods() as $method) {
            $this->providers[$method] = $provider;
        }
    }

    public function getProvider(string $paymentMethod): ?PaymentProvider
    {
        return $this->providers[$paymentMethod] ?? null;
    }

    public function initiatePayment(Sale $sale, string $paymentMethod, array $paymentData): PaymentIntent
    {
        $provider = $this->getProvider($paymentMethod);

        if (! $provider) {
            return new PaymentIntent(
                paymentMethod: $paymentMethod,
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: $paymentData['currency'] ?? 'KES',
                reference: 'UNKNOWN-'.Str::random(8),
                instructions: 'Payment provider not configured for: '.$paymentMethod,
                metadata: ['error' => 'provider_not_found'],
            );
        }

        try {
            return $provider->initiatePayment($sale, $paymentData);
        } catch (\Throwable $e) {
            Log::error('Payment initiation failed', [
                'sale_id' => $sale->id,
                'payment_method' => $paymentMethod,
                'error' => $e->getMessage(),
            ]);

            return new PaymentIntent(
                paymentMethod: $paymentMethod,
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: $paymentData['currency'] ?? 'KES',
                reference: 'ERROR-'.Str::random(8),
                instructions: 'Payment initiation failed. Please try again.',
                metadata: ['error' => $e->getMessage()],
            );
        }
    }

    public function handleCallback(string $paymentMethod, array $payload): PaymentCallbackResult
    {
        $provider = $this->getProvider($paymentMethod);

        if (! $provider) {
            return new PaymentCallbackResult(
                success: false,
                externalTransactionId: 'UNKNOWN-'.Str::random(8),
                status: 'failed',
                amountMinor: 0,
                currency: 'KES',
                errorMessage: 'Payment provider not found: '.$paymentMethod,
            );
        }

        try {
            return $provider->handleCallback($payload);
        } catch (\Throwable $e) {
            Log::error('Payment callback handling failed', [
                'payment_method' => $paymentMethod,
                'error' => $e->getMessage(),
            ]);

            return new PaymentCallbackResult(
                success: false,
                externalTransactionId: 'ERROR-'.Str::random(8),
                status: 'failed',
                amountMinor: 0,
                currency: 'KES',
                errorMessage: $e->getMessage(),
            );
        }
    }

    public function verifyPayment(string $paymentMethod, string $externalTransactionId): PaymentStatus
    {
        $provider = $this->getProvider($paymentMethod);

        if (! $provider) {
            return new PaymentStatus(
                status: 'unknown',
                amountMinor: 0,
                currency: 'KES',
                externalTransactionId: $externalTransactionId,
            );
        }

        try {
            return $provider->verifyPayment($externalTransactionId);
        } catch (\Throwable $e) {
            Log::error('Payment verification failed', [
                'payment_method' => $paymentMethod,
                'external_transaction_id' => $externalTransactionId,
                'error' => $e->getMessage(),
            ]);

            return new PaymentStatus(
                status: 'unknown',
                amountMinor: 0,
                currency: 'KES',
                externalTransactionId: $externalTransactionId,
            );
        }
    }

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult
    {
        $provider = $this->getProvider($payment->payment_method);

        if (! $provider) {
            return new RefundResult(
                success: false,
                externalRefundId: '',
                status: 'failed',
                amountMinor: $amountMinor,
                currency: $payment->currency,
                errorMessage: 'Payment provider not found: '.$payment->payment_method,
            );
        }

        try {
            return $provider->initiateRefund($payment, $amountMinor, $reason);
        } catch (\Throwable $e) {
            Log::error('Refund initiation failed', [
                'payment_id' => $payment->id,
                'payment_method' => $payment->payment_method,
                'error' => $e->getMessage(),
            ]);

            return new RefundResult(
                success: false,
                externalRefundId: '',
                status: 'failed',
                amountMinor: $amountMinor,
                currency: $payment->currency,
                errorMessage: $e->getMessage(),
            );
        }
    }

    public function getAvailableMethods(): array
    {
        $methods = [];
        foreach ($this->providers as $provider) {
            $methods = array_merge($methods, $provider->getSupportedMethods());
        }

        return array_unique($methods);
    }
}
