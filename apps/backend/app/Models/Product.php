<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'category_id',
        'sku',
        'barcode',
        'name',
        'description',
        'tax_category_code',
        'unit',
        'cost_price_minor',
        'selling_price_minor',
        'reorder_level',
        'track_inventory',
        'is_active',
        'version',
        'key',
    ];

    protected $casts = [
        'cost_price_minor' => 'integer',
        'selling_price_minor' => 'integer',
        'reorder_level' => 'integer',
        'track_inventory' => 'boolean',
        'is_active' => 'boolean',
        'version' => 'integer',
        'accounting_ids' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getAccountingId(string $provider): ?string
    {
        $ids = $this->accounting_ids ?? [];
        return $ids[$provider] ?? null;
    }

    public function setAccountingId(string $provider, string $externalId): void
    {
        $ids = $this->accounting_ids ?? [];
        $ids[$provider] = $externalId;
        $this->update(['accounting_ids' => $ids]);
    }
}
