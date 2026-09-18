<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExchangeRate extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'currency_id',
        'effective_date',
        'rate',
        'source',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'rate' => 'decimal:6',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
