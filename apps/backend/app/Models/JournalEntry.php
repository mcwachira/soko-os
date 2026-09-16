<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalEntry extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'reference_type',
        'reference_id',
        'entry_date',
        'notes',
        'status',
        'posted_at',
        'posted_by_user_id',
        'entry_type',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'posted_at' => 'datetime',
    ];

    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }
}
