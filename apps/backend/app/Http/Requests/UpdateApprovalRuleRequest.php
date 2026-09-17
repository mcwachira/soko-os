<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApprovalRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entity_type' => ['sometimes', 'string', 'max:100'],
            'min_amount_minor' => ['nullable', 'integer', 'min:0'],
            'max_amount_minor' => ['nullable', 'integer', 'min:0'],
            'department' => ['nullable', 'string', 'max:100'],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'supplier_id' => ['nullable', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'category' => ['nullable', 'string', 'max:100'],
            'cost_center' => ['nullable', 'string', 'max:100'],
            'project_id' => ['nullable', 'uuid', Rule::exists('projects', 'id')->where('organization_id', $this->user()->organization_id)],
            'currency' => ['nullable', 'string', 'max:3'],
            'purchase_type' => ['nullable', 'string', 'max:50'],
            'risk' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
