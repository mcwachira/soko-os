<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #000; text-align: left; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Invoice {{ $invoice->invoice_number }}</h1>
    <p><strong>Customer:</strong> {{ $invoice->customer->name ?? 'N/A' }}</p>
    <p><strong>Date:</strong> {{ $invoice->issue_date }}</p>
    <p><strong>Due Date:</strong> {{ $invoice->due_date }}</p>

    <h2>Items</h2>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
            <tr>
                <td>{{ $item->description }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ number_format($item->unit_price_minor / 100, 2) }}</td>
                <td>{{ number_format(($item->quantity * $item->unit_price_minor - $item->discount_minor) / 100, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Totals</h2>
    <p><strong>Subtotal:</strong> {{ number_format($invoice->subtotal_minor / 100, 2) }}</p>
    <p><strong>Tax:</strong> {{ number_format($invoice->tax_total_minor / 100, 2) }}</p>
    <p><strong>Total:</strong> {{ number_format($invoice->grand_total_minor / 100, 2) }}</p>
</body>
</html>
