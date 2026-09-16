<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncPushRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_id' => ['required', 'string', 'max:255'],
            'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'cursor' => ['nullable', 'string'],
            'operations' => ['required', 'array'],
            'operations.*.operation_id' => ['required', 'string', 'max:255'],
            'operations.*.idempotency_key' => ['required', 'string', 'max:255'],
            'operations.*.entity_name' => ['required', 'string', Rule::in(['sales', 'customers', 'inventory_movements', 'cash_shifts', 'products'])],
            'operations.*.action' => ['required', 'string', Rule::in(['create', 'update', 'delete'])],
            'operations.*.local_id' => ['required', 'string', 'max:255'],
            'operations.*.data' => ['required', 'array'],
            'operations.*.created_at' => ['required', 'date'],
        ];
    }
}
