<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfqAttachment extends Model
{
    use HasUuids;
    protected $fillable = [
        'organization_id',
        'rfq_id',
        'filename',
        'url',
        'mime_type',
        'size_bytes',
    ];

    public function rfq()
    {
        return $this->belongsTo(Rfq::class);
    }
}
