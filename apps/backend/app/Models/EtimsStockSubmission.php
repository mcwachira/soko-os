<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtimsStockSubmission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'event_type',
        'inventory_event_id',
        'payload',
        'hash',
        'submission_status',
        'attempt_count',
        'last_attempt_at',
        'next_retry_at',
        'external_reference',
        'response_code',
        'response_payload',
        'error_message',
        'submitted_at',
        'accepted_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'response_payload' => 'array',
        'attempt_count' => 'integer',
        'last_attempt_at' => 'datetime',
        'next_retry_at' => 'datetime',
        'submitted_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function inventoryEvent()
    {
        return $this->belongsTo(InventoryMovement::class, 'inventory_event_id');
    }
}
