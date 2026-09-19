<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'customer_id',
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
        'budget_minor',
        'billed_minor',
        'cost_minor',
    ];

    protected $casts = [
        'budget_minor' => 'integer',
        'billed_minor' => 'integer',
        'cost_minor' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }

    public function expenses()
    {
        return $this->hasMany(ProjectExpense::class);
    }
}
