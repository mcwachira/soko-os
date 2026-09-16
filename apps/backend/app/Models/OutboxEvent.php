<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutboxEvent extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'event_name',
        'payload',
        'status',
        'retry_count',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
