<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MpesaPaymentProvider implements PaymentProvider
{
    protected string $consumerKey;

    protected string $consumerSecret;

    protected string $baseUrl;

    protected string $passkey;

    protected string $shortCode;

    protected string $callbackUrl;

    protected string $environment;

    public function __construct()
    {
        $this->consumerKey = config('payments.mpesa.consumer_key');
        $this->consumerSecret = config('payments.mpesa.consumer_secret');
        $this->baseUrl = config('payments.mpesa.base_url', 'https://sandbox.safaricom.co.ke');
        $this->passkey = config('payments.mpesa.passkey');
        $this->shortCode = config('payments.mpesa.short_code');
        $this->callbackUrl = config('payments.mpesa.callback_url');
        $this->environment = config('payments.mpesa.environment', 'sandbox');
    }

    public function hasCredentials(): bool
    {
        return filled($this->consumerKey)
            && filled($this->consumerSecret)
            && filled($this->passkey)
            && filled($this->shortCode)
            && ! str_contains($this->consumerKey, 'placeholder');
    }

    public function initiatePayment(Sale $sale, array $paymentData): PaymentIntent
    {
        if (! $this->hasCredentials()) {
            return new PaymentIntent(
                paymentMethod: 'mpesa',
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: 'KES',
                reference: $paymentData['reference'] ?? 'MPESA-'.Str::random(8),
                instructions: 'M-Pesa STK Push initiated. Check your phone for the prompt.',
                metadata: [
                    'phone_number' => $paymentData['phone_number'] ?? null,
                    'account_reference' => $sale->receipt_number,
                    'transaction_desc' => 'Payment for '.$sale->receipt_number,
                ],
            );
        }

        $phoneNumber = $paymentData['phone_number'] ?? null;
        if (! $phoneNumber) {
            return new PaymentIntent(
                paymentMethod: 'mpesa',
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: 'KES',
                reference: $paymentData['reference'] ?? 'MPESA-'.Str::random(8),
                instructions: 'Phone number required for M-Pesa STK Push',
                metadata: ['error' => 'phone_number_required'],
            );
        }

        try {
            $accessToken = $this->getAccessToken();

            $timestamp = now()->format('YmdHms');
            $password = base64_encode($this->shortCode.$this->passkey.$timestamp);

            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->post($this->baseUrl.'/mpesa/stkpush/v1/processrequest', [
                    'BusinessShortCode' => $this->shortCode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => (int) (($paymentData['amount_minor'] ?? $sale->grand_total_minor) / 100),
                    'PartyA' => $this->formatPhoneNumber($phoneNumber),
                    'PartyB' => $this->shortCode,
                    'PhoneNumber' => $this->formatPhoneNumber($phoneNumber),
                    'CallBackURL' => $this->callbackUrl,
                    'AccountReference' => $sale->receipt_number,
                    'TransactionDesc' => 'Payment for '.$sale->receipt_number,
                ]);

            $data = $response->json();

            if ($response->successful() && ($data['ResponseCode'] ?? '1') === '0') {
                return new PaymentIntent(
                    paymentMethod: 'mpesa',
                    amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                    currency: 'KES',
                    reference: $data['CheckoutRequestID'] ?? 'MPESA-'.Str::random(8),
                    instructions: 'M-Pesa STK Push sent. Enter PIN on your phone.',
                    metadata: [
                        'checkout_request_id' => $data['CheckoutRequestID'] ?? null,
                        'merchant_request_id' => $data['MerchantRequestID'] ?? null,
                        'phone_number' => $phoneNumber,
                    ],
                );
            }

            return new PaymentIntent(
                paymentMethod: 'mpesa',
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: 'KES',
                reference: $data['CheckoutRequestID'] ?? 'MPESA-'.Str::random(8),
                instructions: 'M-Pesa STK Push failed: '.($data['ResponseDescription'] ?? 'Unknown error'),
                metadata: ['error' => $data['ResponseDescription'] ?? 'stk_push_failed'],
            );

        } catch (\Throwable $e) {
            Log::error('M-Pesa STK Push failed', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage(),
            ]);

            return new PaymentIntent(
                paymentMethod: 'mpesa',
                amountMinor: $paymentData['amount_minor'] ?? $sale->grand_total_minor,
                currency: 'KES',
                reference: 'MPESA-'.Str::random(8),
                instructions: 'M-Pesa STK Push failed. Please try again.',
                metadata: ['error' => $e->getMessage()],
            );
        }
    }

    public function handleCallback(array $payload): PaymentCallbackResult
    {
        $stkCallback = $payload['Body']['stkCallback'] ?? [];
        $resultCode = $stkCallback['ResultCode'] ?? 1;
        $checkoutRequestId = $stkCallback['CheckoutRequestID'] ?? null;

        $success = $resultCode === 0;

        $amountMinor = 0;
        if ($success) {
            $callbackMetadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            foreach ($callbackMetadata as $item) {
                if ($item['Name'] === 'Amount') {
                    $amountMinor = (int) ($item['Value'] * 100);
                    break;
                }
            }
        }

        return new PaymentCallbackResult(
            success: $success,
            externalTransactionId: $checkoutRequestId ?? 'MPESA-'.Str::random(8),
            status: $success ? 'paid' : 'failed',
            amountMinor: $amountMinor,
            currency: 'KES',
            reference: $checkoutRequestId,
            providerResponse: $payload,
            errorMessage: $success ? null : ($stkCallback['ResultDesc'] ?? 'M-Pesa payment failed'),
        );
    }

    public function verifyPayment(string $externalTransactionId): PaymentStatus
    {
        if (! $this->hasCredentials()) {
            return new PaymentStatus(
                status: 'pending',
                amountMinor: 0,
                currency: 'KES',
                externalTransactionId: $externalTransactionId,
            );
        }

        try {
            $accessToken = $this->getAccessToken();
            $timestamp = now()->format('YmdHms');
            $password = base64_encode($this->shortCode.$this->passkey.$timestamp);

            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->post($this->baseUrl.'/mpesa/stkpushquery/v1/query', [
                    'BusinessShortCode' => $this->shortCode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'CheckoutRequestID' => $externalTransactionId,
                ]);

            $data = $response->json();
            $resultCode = $data['ResultCode'] ?? '1';

            return new PaymentStatus(
                status: $resultCode === '0' ? 'paid' : 'failed',
                amountMinor: 0,
                currency: 'KES',
                externalTransactionId: $externalTransactionId,
                providerResponse: $data,
            );

        } catch (\Throwable $e) {
            Log::error('M-Pesa payment verification failed', [
                'checkout_request_id' => $externalTransactionId,
                'error' => $e->getMessage(),
            ]);

            return new PaymentStatus(
                status: 'pending',
                amountMinor: 0,
                currency: 'KES',
                externalTransactionId: $externalTransactionId,
            );
        }
    }

    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult
    {
        if (! $this->hasCredentials()) {
            return new RefundResult(
                success: false,
                externalRefundId: '',
                status: 'failed',
                amountMinor: $amountMinor,
                currency: $payment->currency,
                errorMessage: 'M-Pesa credentials not configured',
            );
        }

        try {
            $accessToken = $this->getAccessToken();

            $response = Http::withToken($accessToken)
                ->timeout(30)
                ->post($this->baseUrl.'/mpesa/reversal/v1/request', [
                    'Initiator' => config('payments.mpesa.initiator_name'),
                    'SecurityCredential' => config('payments.mpesa.security_credential'),
                    'CommandID' => 'TransactionReversal',
                    'TransactionID' => $payment->external_transaction_id,
                    'Amount' => (int) ($amountMinor / 100),
                    'ReceiverParty' => $this->shortCode,
                    'RecieverIdentifierType' => '11',
                    'ResultURL' => $this->callbackUrl.'/reversal',
                    'QueueTimeOutURL' => $this->callbackUrl.'/reversal/timeout',
                    'Remarks' => $reason,
                    'Occasion' => 'Refund',
                ]);

            $data = $response->json();

            return new RefundResult(
                success: $response->successful() && ($data['ResponseCode'] ?? '1') === '0',
                externalRefundId: $data['ConversationID'] ?? 'MPESA-REF-'.Str::random(8),
                status: ($data['ResponseCode'] ?? '1') === '0' ? 'pending' : 'failed',
                amountMinor: $amountMinor,
                currency: $payment->currency,
                providerResponse: $data,
                errorMessage: ($data['ResponseCode'] ?? '1') === '0' ? null : ($data['ResponseDescription'] ?? 'M-Pesa refund failed'),
            );

        } catch (\Throwable $e) {
            Log::error('M-Pesa refund failed', [
                'payment_id' => $payment->id,
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

    public function getName(): string
    {
        return 'mpesa';
    }

    public function getSupportedMethods(): array
    {
        return ['mpesa'];
    }

    protected function getAccessToken(): string
    {
        $cacheKey = "mpesa_access_token_$this->environment";

        return cache()->remember($cacheKey, 55 * 60, function () {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->timeout(30)
                ->get($this->baseUrl.'/oauth/v1/generate?grant_type=client_credentials');

            if (! $response->successful()) {
                throw new \Exception('Failed to get M-Pesa access token: '.$response->body());
            }

            return $response->json()['access_token'] ?? '';
        });
    }

    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '254')) {
            return $phone;
        }

        if (str_starts_with($phone, '0')) {
            return '254'.substr($phone, 1);
        }

        if (str_starts_with($phone, '7') || str_starts_with($phone, '1')) {
            return '254'.$phone;
        }

        return $phone;
    }
}
