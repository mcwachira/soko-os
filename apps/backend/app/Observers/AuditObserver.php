<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\OutboxEvent;
use App\Models\SyncOperation;
use Illuminate\Database\Eloquent\Model;
use App\Services\Logging\StructuredLogger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;

class AuditObserver
{
    protected StructuredLogger $logger;

    public function __construct()
    {
        $this->logger = StructuredLogger::make()->withAction("audit");
    }

    public function created(Model $model): void
    {
        $this->log($model, "created", [], $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $oldValues = $model->getOriginal();
        $newValues = $model->getDirty();

        if (! empty($newValues)) {
            $this->log($model, "updated", $oldValues, $newValues);
        }
    }

    public function deleted(Model $model): void
    {
        $this->log($model, "deleted", $model->getAttributes(), []);
    }

    protected function log(Model $model, string $action, array $oldValues, array $newValues): void
    {
        $skipModels = [
            AuditLog::class,
            OutboxEvent::class,
            SyncOperation::class,
        ];

        if (in_array(get_class($model), $skipModels)) {
            return;
        }

        if (! $model->getAttribute("organization_id")) {
            return;
        }

        $user = Auth::user();
        $request = Request::capture();

        try {
            AuditLog::create([
                "id" => Str::uuid()->toString(),
                "organization_id" => $model->organization_id,
                "user_id" => $user?->id,
                "action" => $action,
                "entity_type" => class_basename($model),
                "entity_id" => $model->getKey(),
                "old_values" => $oldValues,
                "new_values" => $newValues,
                "ip_address" => $request?->ip(),
                "user_agent" => $request?->userAgent(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->error("Audit logging failed", [
                "model" => get_class($model),
                "action" => $action,
                "error" => $e->getMessage(),
            ]);
        }
    }
}
