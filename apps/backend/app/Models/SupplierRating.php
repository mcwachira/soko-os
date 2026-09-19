<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierRating extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'rated_by_user_id',
        'rating',
        'comments',
        'rated_at',
    ];

    protected $casts = [
        'rated_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function ratedBy()
    {
        return $this->belongsTo(User::class, 'rated_by_user_id');
    }
}
