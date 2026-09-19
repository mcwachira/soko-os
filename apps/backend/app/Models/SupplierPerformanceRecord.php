<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierPerformanceRecord extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'period_start',
        'period_end',
        'on_time_delivery_rate',
        'quality_score',
        ' responsiveness_score',
        'notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'on_time_delivery_rate' => 'decimal:2',
        'quality_score' => 'decimal:2',
        'responsiveness_score' => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
