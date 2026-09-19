<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tender extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'business_id',
        'branch_id',
        'tender_number',
        'title',
        'description',
        'status',
        'submission_deadline',
        'opening_date',
        'evaluation_criteria',
        'created_by_user_id',
        'published_at',
        'awarded_at',
        'custom_fields',
        'notes',
    ];

    protected $casts = [
        'submission_deadline' => 'datetime',
        'opening_date' => 'datetime',
        'published_at' => 'datetime',
        'awarded_at' => 'datetime',
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

    public function documents()
    {
        return $this->hasMany(TenderDocument::class);
    }

    public function bids()
    {
        return $this->hasMany(TenderBid::class);
    }

    public function evaluations()
    {
        return $this->hasMany(TenderEvaluation::class);
    }

    public function award()
    {
        return $this->hasOne(TenderAward::class);
    }
}
