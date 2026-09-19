<?php

namespace App\Services\Ocr;

interface OcrAdapterInterface
{
    public function extract(string $filePath): OcrResult;
}
