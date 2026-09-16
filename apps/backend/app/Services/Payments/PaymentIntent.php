<?php

namespace App\Services\Payments;

readonly class PaymentIntent
{
    public function __construct(
        public string $paymentMethod,
        public int $amountMinor,
        public string $currency,
        public ?string $redirectUrl = null,
        public ?string $instructions = null,
        public ?string $reference = null,
        public array $metadata = [],
    ) {}
}
