<?php

namespace App\Services\Payments;

readonly class PaymentStatus
{
    public function __construct(
        public string $status, // paid, failed, pending, cancelled, refunded, partially_refunded
        public int $amountMinor,
        public string $currency,
        public ?string $externalTransactionId = null,
        public array $providerResponse = [],
    ) {}
}
