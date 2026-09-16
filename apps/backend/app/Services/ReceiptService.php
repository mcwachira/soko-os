<?php

namespace App\Services;

use App\Models\Sale;

class ReceiptService
{
    /**
     * Generate ESC/POS formatted receipt for thermal printer.
     *
     * @return string ESC/POS commands
     */
    public static function generateEscPos(Sale $sale): string
    {
        $escPos = '';

        // Initialize printer
        $escPos .= "\x1B\x40"; // ESC @ - Initialize printer

        // Center alignment
        $escPos .= "\x1B\x61\x01"; // ESC a 1 - Center

        // Business name
        $escPos .= self::text($sale->branch->business->name ?? 'Soko POS', true, true);
        $escPos .= "\x0A"; // New line

        // Branch name
        $escPos .= self::text($sale->branch->name ?? '', false, false);
        $escPos .= "\x0A";

        // Terminal
        $escPos .= self::text('Terminal: '.($sale->terminal->terminal_code ?? ''), false, false);
        $escPos .= "\x0A";

        // Separator
        $escPos .= str_repeat('-', 32)."\x0A";

        // Left alignment for items
        $escPos .= "\x1B\x61\x00"; // ESC a 0 - Left

        // Receipt number and date
        $escPos .= self::text('Receipt: '.$sale->receipt_number, false, false);
        $escPos .= "\x0A";
        $escPos .= self::text('Date: '.$sale->created_at->format('Y-m-d H:i:s'), false, false);
        $escPos .= "\x0A";
        $escPos .= self::text('Cashier: '.($sale->cashier->name ?? ''), false, false);
        $escPos .= "\x0A";

        // Customer if present
        if ($sale->customer) {
            $escPos .= self::text('Customer: '.$sale->customer->name, false, false);
            $escPos .= "\x0A";
        }

        // Separator
        $escPos .= str_repeat('-', 32)."\x0A";

        // Header for items
        $escPos .= self::text(sprintf('%-20s %4s %8s %8s', 'Item', 'Qty', 'Price', 'Total'), false, false);
        $escPos .= "\x0A";
        $escPos .= str_repeat('-', 32)."\x0A";

        // Items
        foreach ($sale->items as $item) {
            $name = self::truncate($item->name, 20);
            $qty = str_pad($item->quantity, 4, ' ', STR_PAD_LEFT);
            $price = self::formatMoney($item->unit_price_minor);
            $total = self::formatMoney($item->total_minor);

            $escPos .= self::text(sprintf('%-20s %4s %8s %8s', $name, $qty, $price, $total), false, false);
            $escPos .= "\x0A";

            // Tax info for item
            if ($item->tax_amount_minor > 0) {
                $escPos .= self::text(sprintf('  VAT %.2f%%: %s', $item->tax_rate_percentage, self::formatMoney($item->tax_amount_minor)), false, false);
                $escPos .= "\x0A";
            }
        }

        // Separator
        $escPos .= str_repeat('-', 32)."\x0A";

        // Totals
        $escPos .= self::text(sprintf('%-20s %12s', 'Subtotal:', self::formatMoney($sale->subtotal_minor)), false, false);
        $escPos .= "\x0A";

        if ($sale->discount_minor > 0) {
            $escPos .= self::text(sprintf('%-20s %12s', 'Discount:', '-'.self::formatMoney($sale->discount_minor)), false, false);
            $escPos .= "\x0A";
        }

        $escPos .= self::text(sprintf('%-20s %12s', 'Tax:', self::formatMoney($sale->tax_total_minor)), false, false);
        $escPos .= "\x0A";

        // Total - bold and larger
        $escPos .= "\x1B\x45\x01"; // ESC E 1 - Bold on
        $escPos .= "\x1D\x21\x11"; // GS ! 17 - Double width and height
        $escPos .= self::text(sprintf('%-20s %12s', 'TOTAL:', self::formatMoney($sale->grand_total_minor)), false, false);
        $escPos .= "\x0A";
        $escPos .= "\x1B\x45\x00"; // ESC E 0 - Bold off
        $escPos .= "\x1D\x21\x00"; // GS ! 0 - Normal size

        // Payment method
        $paymentMethods = $sale->payments->pluck('payment_method')->unique()->implode(', ');
        $escPos .= str_repeat('-', 32)."\x0A";
        $escPos .= self::text('Paid by: '.ucfirst($paymentMethods), false, false);
        $escPos .= "\x0A";

        // Change if any
        if ($sale->change_due_minor > 0) {
            $escPos .= self::text('Change: '.self::formatMoney($sale->change_due_minor), false, false);
            $escPos .= "\x0A";
        }

        // Separator
        $escPos .= str_repeat('=', 32)."\x0A";

        // Tax info
        $escPos .= self::text('VAT Inclusive', false, false);
        $escPos .= "\x0A";

        // QR code placeholder
        $escPos .= str_repeat('-', 32)."\x0A";
        $escPos .= self::text('Thank you for shopping!', true, false);
        $escPos .= "\x0A";
        $escPos .= self::text('Visit us again!', true, false);
        $escPos .= "\x0A\x0A\x0A\x0A";

        // Cut paper
        $escPos .= "\x1D\x56\x41\x00"; // GS V A 0 - Partial cut

        return $escPos;
    }

    /**
     * Generate HTML receipt for browser printing.
     *
     * @return string HTML
     */
    public static function generateHtml(Sale $sale): string
    {
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - '.$sale->receipt_number.'</title>
    <style>
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
        }
        body {
            font-family: "Courier New", monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 16px; font-weight: bold; }
        .right { text-align: right; }
        .left { text-align: left; }
        hr { border: 0; border-top: 1px dashed #000; margin: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .items-table td { padding: 2px 0; }
        .items-table .qty { text-align: right; width: 40px; }
        .items-table .price { text-align: right; width: 60px; }
        .items-table .total { text-align: right; width: 70px; }
        .totals { font-size: 12px; }
        .totals .label { display: inline-block; width: 60%; }
        .totals .value { display: inline-block; width: 40%; text-align: right; }
        .total-row { font-size: 16px; font-weight: bold; }
        .payment-info { margin-top: 10px; font-size: 11px; }
        .qr-placeholder { width: 100px; height: 100px; margin: 10px auto; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="center">
        <div class="bold large">'.($sale->branch->business->name ?? 'Soko POS').'</div>
        <div>'.($sale->branch->name ?? '').'</div>
        <div>Terminal: '.($sale->terminal->terminal_code ?? '').'</div>
    </div>
    <hr>
    <div class="left">
        <div>Receipt: '.$sale->receipt_number.'</div>
        <div>Date: '.$sale->created_at->format('Y-m-d H:i:s').'</div>
        <div>Cashier: '.($sale->cashier->name ?? '').'</div>';

        if ($sale->customer) {
            $html .= '<div>Customer: '.$sale->customer->name.'</div>';
        }

        $html .= '</div>
        <hr>
        <table class="items-table">
            <thead>
                <tr>
                    <td style="width: 45%">Item</td>
                    <td class="qty">Qty</td>
                    <td class="price">Price</td>
                    <td class="total">Total</td>
                </tr>
            </thead>
            <tbody>';

        foreach ($sale->items as $item) {
            $html .= '<tr>
                <td>'.htmlspecialchars($item->name).'</td>
                <td class="qty">'.$item->quantity.'</td>
                <td class="price">'.number_format($item->unit_price_minor / 100, 2).'</td>
                <td class="total">'.number_format($item->total_minor / 100, 2).'</td>
            </tr>';
            if ($item->tax_amount_minor > 0) {
                $html .= '<tr><td colspan="4" style="font-size: 10px; color: #666;">  VAT '.$item->tax_rate_percentage.'%: '.number_format($item->tax_amount_minor / 100, 2).'</td></tr>';
            }
        }

        $html .= '</tbody>
        </table>
        <hr>
        <div class="totals">
            <div><span class="label">Subtotal:</span><span class="value">'.number_format($sale->subtotal_minor / 100, 2).'</span></div>';

        if ($sale->discount_minor > 0) {
            $html .= '<div><span class="label">Discount:</span><span class="value">-'.number_format($sale->discount_minor / 100, 2).'</span></div>';
        }

        $html .= '<div><span class="label">Tax:</span><span class="value">'.number_format($sale->tax_total_minor / 100, 2).'</span></div>
            <div class="total-row"><span class="label">TOTAL:</span><span class="value">'.number_format($sale->grand_total_minor / 100, 2).'</span></div>
        </div>
        <hr>
        <div class="payment-info">
            <div>Paid by: '.ucfirst($sale->payments->pluck('payment_method')->unique()->implode(', ')).'</div>';

        if ($sale->change_due_minor > 0) {
            $html .= '<div>Change: '.number_format($sale->change_due_minor / 100, 2).'</div>';
        }

        $html .= '</div>
        <hr>
        <div class="center">
            <div class="qr-placeholder">QR Code</div>
            <div>VAT Inclusive</div>
            <br>
            <div class="bold">Thank you for shopping!</div>
            <div>Visit us again!</div>
        </div>
    </body>
</html>';

        return $html;
    }

    /**
     * Format money from minor units.
     */
    private static function formatMoney(int $minor): string
    {
        return number_format($minor / 100, 2);
    }

    /**
     * Generate text line for ESC/POS.
     */
    private static function text(string $text, bool $center = false, bool $bold = false): string
    {
        $cmd = '';
        if ($center) {
            $cmd .= "\x1B\x61\x01"; // Center
        } else {
            $cmd .= "\x1B\x61\x00"; // Left
        }
        if ($bold) {
            $cmd .= "\x1B\x45\x01"; // Bold on
        }
        $cmd .= $text;
        if ($bold) {
            $cmd .= "\x1B\x45\x00"; // Bold off
        }
        $cmd .= "\x0A";

        return $cmd;
    }

    /**
     * Truncate string to max length.
     */
    private static function truncate(string $string, int $length): string
    {
        return strlen($string) > $length ? substr($string, 0, $length - 3).'...' : $string;
    }
}
