<?php

namespace App\Services\Logging;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StructuredLogger
{
    protected string $correlationId;

    protected array $context = [];

    public function __construct(?string $correlationId = null)
    {
        $this->correlationId = $correlationId ?? Str::uuid()->toString();
    }

    public static function make(?string $correlationId = null): self
    {
        return new self($correlationId);
    }

    public function withContext(array $context): self
    {
        $this->context = array_merge($this->context, $context);

        return $this;
    }

    public function withUser(string $userId): self
    {
        $this->context['user_id'] = $userId;

        return $this;
    }

    public function withOrganization(string $organizationId): self
    {
        $this->context['organization_id'] = $organizationId;

        return $this;
    }

    public function withBusiness(string $businessId): self
    {
        $this->context['business_id'] = $businessId;

        return $this;
    }

    public function withBranch(string $branchId): self
    {
        $this->context['branch_id'] = $branchId;

        return $this;
    }

    public function withDevice(string $deviceId): self
    {
        $this->context['device_id'] = $deviceId;

        return $this;
    }

    public function withRequestId(string $requestId): self
    {
        $this->context['request_id'] = $requestId;

        return $this;
    }

    public function withEntity(string $entityType, string $entityId): self
    {
        $this->context['entity_type'] = $entityType;
        $this->context['entity_id'] = $entityId;

        return $this;
    }

    public function withAction(string $action): self
    {
        $this->context['action'] = $action;

        return $this;
    }

    public function withMetadata(array $metadata): self
    {
        $this->context['metadata'] = $metadata;

        return $this;
    }

    protected function buildContext(): array
    {
        return array_merge([
            'correlation_id' => $this->correlationId,
            'timestamp' => now()->toIso8601String(),
            'environment' => app()->environment(),
            'service' => 'soko-os-backend',
        ], $this->context);
    }

    public function info(string $message, array $context = []): void
    {
        Log::info($message, array_merge($this->buildContext(), $context));
    }

    public function warning(string $message, array $context = []): void
    {
        Log::warning($message, array_merge($this->buildContext(), $context));
    }

    public function error(string $message, array $context = []): void
    {
        Log::error($message, array_merge($this->buildContext(), $context));
    }

    public function debug(string $message, array $context = []): void
    {
        Log::debug($message, array_merge($this->buildContext(), $context));
    }

    public function critical(string $message, array $context = []): void
    {
        Log::critical($message, array_merge($this->buildContext(), $context));
    }

    public function notice(string $message, array $context = []): void
    {
        Log::notice($message, array_merge($this->buildContext(), $context));
    }

    public function alert(string $message, array $context = []): void
    {
        Log::alert($message, array_merge($this->buildContext(), $context));
    }

    public function emergency(string $message, array $context = []): void
    {
        Log::emergency($message, array_merge($this->buildContext(), $context));
    }

    public function getCorrelationId(): string
    {
        return $this->correlationId;
    }
}
