<?php

namespace App\Services\Ocr;

readonly class OcrResult
{
    public function __construct(
        public string $vendor,
        public string $date,
        public string $invoiceNumber,
        public int $subtotalMinor,
        public int $taxMinor,
        public int $totalMinor,
        public string $currency,
        public array $raw
    ) {}
}
