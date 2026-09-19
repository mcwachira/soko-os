<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rfq extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'warehouse_id',
        'rfq_number',
        'title',
        'description',
        'status',
        'submission_deadline',
        'delivery_required_date',
        'commercial_terms',
        'payment_terms',
        'tax_requirements',
        'evaluation_criteria',
        'created_by_user_id',
        'published_at',
        'closed_at',
        'custom_fields',
        'notes',
    ];

    protected $casts = [
        'submission_deadline' => 'datetime',
        'delivery_required_date' => 'date',
        'published_at' => 'datetime',
        'closed_at' => 'datetime',
        'evaluation_criteria' => 'array',
        'custom_fields' => 'array',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function lines()
    {
        return $this->hasMany(RfqLine::class);
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'rfq_suppliers')
            ->withPivot('invited_at', 'responded_at')
            ->withTimestamps();
    }

    public function questions()
    {
        return $this->hasMany(RfqQuestion::class);
    }

    public function responses()
    {
        return $this->hasMany(RfqResponse::class);
    }

    public function attachments()
    {
        return $this->hasMany(RfqAttachment::class);
    }
}
