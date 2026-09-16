<?php

namespace App\Services\Payments;

readonly class PaymentCallbackResult
{
    public function __construct(
        public bool $success,
        public string $externalTransactionId,
        public string $status, // paid, failed, pending, cancelled
        public int $amountMinor,
        public string $currency,
        public ?string $reference = null,
        public array $providerResponse = [],
        public ?string $errorMessage = null,
    ) {}
}
