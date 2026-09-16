<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'code',
        'name',
        'phone',
        'email',
        'tax_pin',
        'credit_limit_minor',
        'current_balance_minor',
        'loyalty_points',
        'price_level',
    ];

    protected $casts = [
        'credit_limit_minor' => 'integer',
        'current_balance_minor' => 'integer',
        'loyalty_points' => 'integer',
        'accounting_ids' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
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
