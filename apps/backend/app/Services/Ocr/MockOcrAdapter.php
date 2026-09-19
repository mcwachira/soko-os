<?php

namespace App\Services\Ocr;

class MockOcrAdapter implements OcrAdapterInterface
{
    public function extract(string $filePath): OcrResult
    {
        return new OcrResult(
            vendor: 'Unknown Vendor',
            date: now()->toDateString(),
            invoiceNumber: 'UNKNOWN',
            subtotalMinor: 0,
            taxMinor: 0,
            totalMinor: 0,
            currency: 'KES',
            raw: ['file' => $filePath]
        );
    }
}
