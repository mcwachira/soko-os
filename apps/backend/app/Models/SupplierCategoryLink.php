<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierCategoryLink extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'supplier_id',
        'supplier_category_id',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(SupplierCategory::class);
    }
}
