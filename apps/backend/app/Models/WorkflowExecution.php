<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowExecution extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'workflow_id',
        'organization_id',
        'trigger_entity_type',
        'trigger_entity_id',
        'status',
        'input',
        'output',
        'error_message',
        'retry_count',
        'executed_at',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
        'executed_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
