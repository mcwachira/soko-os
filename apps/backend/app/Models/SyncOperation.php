<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncOperation extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'branch_id',
        'device_id',
        'idempotency_key',
        'entity_name',
        'action',
        'local_id',
        'server_id',
        'payload',
        'status',
        'error_message',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
