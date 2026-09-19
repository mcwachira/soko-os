<?php

namespace App\Services\Ocr;

class OcrService
{
    public function __construct(protected OcrAdapterInterface $adapter) {}

    public function processReceipt(string $filePath): OcrResult
    {
        return $this->adapter->extract($filePath);
    }
}
