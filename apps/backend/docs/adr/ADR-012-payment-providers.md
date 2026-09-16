# ADR-012: Payment Provider Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Soko-OS must support multiple payment methods: Cash, Card, M-Pesa, Airtel Money, Bank Transfer, with extensibility for future providers.

## Decision

**Payment Provider Interface with Manager**

### Interface
```php
interface PaymentProvider {
    public function initiatePayment(Sale $sale, array $data): PaymentIntent;
    public function handleCallback(array $payload): PaymentCallbackResult;
    public function verifyPayment(string $externalTransactionId): PaymentStatus;
    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult;
    public function getName(): string;
    public function getSupportedMethods(): array;
}
```

### DTOs
```php
readonly class PaymentIntent {
    public string $paymentMethod;
    public int $amountMinor;
    public string $currency;
    public ?string $redirectUrl;
    public ?string $instructions;
    public ?string $reference;
    public array $metadata;
}

readonly class PaymentCallbackResult {
    public bool $success;
    public string $externalTransactionId;
    public string $status;  // paid, failed, pending, cancelled
    public int $amountMinor;
    public string $currency;
    public ?string $reference;
    public array $providerResponse;
    public ?string $errorMessage;
}

readonly class PaymentStatus {
    public string $status;
    public int $amountMinor;
    public string $currency;
    public ?string $externalTransactionId;
    public array $providerResponse;
}

readonly class RefundResult {
    public bool $success;
    public string $externalRefundId;
    public string $status;  // pending, completed, failed
    public int $amountMinor;
    public string $currency;
    public ?string $errorMessage;
    public array $providerResponse;
}
```

### Implemented Providers

| Provider | Class | Methods | Status |
|----------|-------|---------|--------|
| Cash | `CashPaymentProvider` | cash | ✅ Complete |
| Card | `CardPaymentProvider` | card | Scaffold (terminal integration needed) |
| M-Pesa | `MpesaPaymentProvider` | mpesa | Scaffold (Daraja STK Push) |
| Bank | `BankPaymentProvider` | bank | Scaffold (manual verification) |

### Manager
```php
class PaymentProviderManager {
    public function initiatePayment(Sale $sale, string $method, array $data): PaymentIntent;
    public function handleCallback(string $method, array $payload): PaymentCallbackResult;
    public function verifyPayment(string $method, string $externalId): PaymentStatus;
    public function initiateRefund(Payment $payment, int $amountMinor, string $reason): RefundResult;
    public function getAvailableMethods(): array;
}
```

### M-Pesa (Daraja) Architecture
```
STK Push Flow:
1. Client → POST /api/v1/sales (payment_method: mpesa, phone_number)
2. SaleController → PaymentProviderManager::initiatePayment()
3. MpesaPaymentProvider::initiatePayment()
   ├── Get OAuth2 token (cached 55 min)
   ├── Build STK Push payload
   ├── POST /mpesa/stkpush/v1/processrequest
   └── Return PaymentIntent with CheckoutRequestID
4. KRA Callback → POST /api/v1/payments/mpesa/callback
5. MpesaPaymentProvider::handleCallback()
   ├── Parse ResultCode
   ├── Update Payment status
   └── Return PaymentCallbackResult
```

### Credentials
```env
# M-Pesa (Daraja)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORT_CODE=
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox
MPESA_INITIATOR_NAME=
MPESA_SECURITY_CREDENTIAL=

# Card
CARD_TERMINAL_ID=
CARD_MERCHANT_ID=
CARD_API_KEY=
```

### Payment State Machine
```
pending → processing → paid
                ↓
            failed → retry (webhook/verification)
                ↓
            cancelled
                ↓
            refunded (partial/full)
```

## Consequences

### Positive
- **Extensible** - New providers implement interface
- **Unified API** - Controllers use `PaymentProviderManager`
- **Idempotent** - All providers use idempotency keys
- **Refund Support** - Built-in refund flow per provider

### Negative
- **Provider Quirks** - Each has different callback formats, states
- **Credential Management** - Multiple OAuth2 flows to maintain
- **Testing** - Requires sandbox credentials per provider

## Implementation Status

| Provider | Initiate | Callback | Verify | Refund | Status |
|----------|----------|----------|--------|--------|--------|
| Cash | ✅ | ✅ | ✅ | ✅ | Complete |
| Card | ✅ | ✅ | ✅ | ✅ | Scaffold |
| M-Pesa | ✅ | ✅ | ✅ | ✅ | Scaffold |
| Bank | ✅ | ✅ | ✅ | ✅ | Scaffold |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single M-Pesa Class | Not extensible, hardcodes Safaricom logic |
| Direct HTTP in Controller | No retry, blocks request, no abstraction |
| Payment Gateway Aggregator | Cost, vendor lock-in, data sovereignty |
