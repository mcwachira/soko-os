<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'loyalty_account_id',
        'sale_id',
        'transaction_type',
        'points',
        'description',
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    public function loyaltyAccount()
    {
        return $this->belongsTo(LoyaltyAccount::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
