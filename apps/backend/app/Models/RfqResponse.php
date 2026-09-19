<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqResponse extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'rfq_id',
        'supplier_id',
        'submitted_at',
        'status',
        'revision',
        'is_final',
        'notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines()
    {
        return $this->hasMany(RfqResponseLine::class);
    }
}
