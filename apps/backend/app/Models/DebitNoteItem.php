<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebitNoteItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'debit_note_id',
        'product_id',
        'description',
        'quantity',
        'unit_cost_minor',
        'discount_minor',
        'tax_rate_percentage',
        'tax_amount_minor',
        'subtotal_minor',
        'total_minor',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost_minor' => 'integer',
        'discount_minor' => 'integer',
        'tax_rate_percentage' => 'decimal:2',
        'tax_amount_minor' => 'integer',
        'subtotal_minor' => 'integer',
        'total_minor' => 'integer',
    ];

    public function debitNote()
    {
        return $this->belongsTo(DebitNote::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
