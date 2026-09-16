<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceOverride extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'sale_id',
        'sale_item_id',
        'product_id',
        'user_id',
        'approved_by_user_id',
        'original_price_minor',
        'new_price_minor',
        'difference_minor',
        'reason',
        'status',
        'approved_at',
    ];

    protected $casts = [
        'original_price_minor' => 'integer',
        'new_price_minor' => 'integer',
        'difference_minor' => 'integer',
        'approved_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
