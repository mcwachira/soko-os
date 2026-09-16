<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'organization_id',
        'business_id',
        'branch_id',
        'terminal_id',
        'device_uuid',
        'device_name',
        'status',
        'last_seen_at',
        'last_sync_at',
        'app_version',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'status' => 'string',
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

    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }
}
