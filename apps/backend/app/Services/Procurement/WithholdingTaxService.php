<?php

namespace App\Services\Procurement;

use App\Models\PaymentVoucher;
use App\Models\PaymentVoucherLine;
use App\Models\SupplierInvoice;
use App\Models\SupplierInvoiceLine;
use InvalidArgumentException;

class WithholdingTaxService
{
    public static function calculateWHT(int $amountMinor, ?string $supplierTaxPin, string $invoiceType = 'goods'): array
    {
        $rate = static::getEffectiveRate($supplierTaxPin, $invoiceType);
        $whtAmount = (int) round($amountMinor * $rate / 100);

        return [
            'rate' => $rate,
            'amount_minor' => $whtAmount,
            'net_amount_minor' => $amountMinor - $whtAmount,
        ];
    }

    public static function getEffectiveRate(?string $taxPin, string $invoiceType = 'goods'): float
    {
        if (empty($taxPin)) {
            return 0.0;
        }

        return match (strtolower($invoiceType)) {
            'services' => 15.0,
            'rent' => 10.0,
            'interest' => 15.0,
            'dividends' => 15.0,
            'default' => 5.0,
        };
    }

    public static function allocateWHT(PaymentVoucher $voucher, array $invoiceLines): PaymentVoucher
    {
        if (empty($invoiceLines)) {
            throw new InvalidArgumentException('Invoice lines are required to allocate WHT.');
        }

        $totalWHT = 0;
        $totalGross = 0;

        foreach ($invoiceLines as $line) {
            if (!$line instanceof SupplierInvoiceLine) {
                throw new InvalidArgumentException('Each line must be a SupplierInvoiceLine instance.');
            }

            $totalGross += $line->total_minor;
        }

        if ($totalGross <= 0) {
            throw new InvalidArgumentException('Total gross amount must be greater than zero.');
        }

        $whtRate = $voucher->wht_rate_percentage ?? 0.0;
        $allocatedWHT = 0;

        foreach ($invoiceLines as $index => $line) {
            $lineWHT = $index === array_key_last($invoiceLines)
                ? (int) round($voucher->wht_amount_minor - $allocatedWHT)
                : (int) round($line->total_minor * $whtRate / 100);

            $allocatedWHT += $lineWHT;
            $totalWHT += $lineWHT;
        }

        return DB::transaction(function () use ($voucher, $invoiceLines, $totalWHT) {
            $voucher->update([
                'wht_amount_minor' => $totalWHT,
                'net_payable_minor' => $voucher->gross_amount_minor - $totalWHT - $voucher->other_deductions_minor,
            ]);

            PaymentVoucherLine::where('payment_voucher_id', $voucher->id)->delete();

            foreach ($invoiceLines as $line) {
                if (!$line instanceof SupplierInvoiceLine) {
                    continue;
                }

                $lineWHT = (int) round($line->total_minor * $voucher->wht_rate_percentage / 100);

                PaymentVoucherLine::create([
                    'organization_id' => $voucher->organization_id,
                    'payment_voucher_id' => $voucher->id,
                    'supplier_invoice_id' => $line->supplier_invoice_id,
                    'amount_minor' => $line->total_minor,
                    'wht_amount_minor' => $lineWHT,
                ]);
            }

            return $voucher->fresh();
        });
    }
}
