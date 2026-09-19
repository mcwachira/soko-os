<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseRequisitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => ['nullable', 'uuid', Rule::exists('businesses', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'warehouse_id' => ['nullable', 'uuid', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)],
            'department' => ['nullable', 'string', 'max:100'],
            'cost_center' => ['nullable', 'string', 'max:100'],
            'project_id' => ['nullable', 'uuid', Rule::exists('projects', 'id')->where('organization_id', $this->user()->organization_id)],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'required_date' => ['nullable', 'date'],
            'reason' => ['nullable', 'string'],
            'budget_minor' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'status' => ['nullable', 'string', 'in:draft,submitted,approved,rejected,converted'],
            'custom_fields' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
