<?php

namespace App\Services\Payments;

readonly class RefundResult
{
    public function __construct(
        public bool $success,
        public string $externalRefundId,
        public string $status, // pending, completed, failed
        public int $amountMinor,
        public string $currency,
        public ?string $errorMessage = null,
        public array $providerResponse = [],
    ) {}
}
