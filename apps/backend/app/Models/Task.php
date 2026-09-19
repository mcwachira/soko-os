<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'project_id',
        'name',
        'description',
        'status',
        'assigned_to_user_id',
        'due_date',
        'estimated_minor',
        'actual_minor',
    ];

    protected $casts = [
        'estimated_minor' => 'integer',
        'actual_minor' => 'integer',
        'due_date' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }
}
