<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;

class SupplierCategory extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'name',
        'description',
    ];
}
