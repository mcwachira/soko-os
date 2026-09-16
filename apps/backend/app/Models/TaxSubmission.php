<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxSubmission extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'sale_id',
        'country_code',
        'tax_authority',
        'status',
        'control_code',
        'qr_code_url',
        'fiscal_signature',
        'request_payload',
        'response_payload',
        'error_message',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
