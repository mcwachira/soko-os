<?php

namespace App\Models\Traits;

trait HasDocumentNumbers
{
    public static function generateAdjustmentNumber(): string
    {
        return 'ADJ-' . strtoupper(uniqid());
    }

    public static function generateStocktakeNumber(): string
    {
        return 'STK-' . strtoupper(uniqid());
    }

    public static function generateTransferNumber(): string
    {
        return 'TRF-' . strtoupper(uniqid());
    }

    public static function generateAssemblyNumber(): string
    {
        return 'ASM-' . strtoupper(uniqid());
    }

    public static function generateLandedCostNumber(): string
    {
        return 'LCN-' . strtoupper(uniqid());
    }

    public static function generatePackageNumber(): string
    {
        return 'PKG-' . strtoupper(uniqid());
    }

    public static function generateShipmentNumber(): string
    {
        return 'SHP-' . strtoupper(uniqid());
    }
}
