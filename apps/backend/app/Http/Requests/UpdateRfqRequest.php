<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRfqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rfqId = $this->route('rfq');

        return [
            'business_id' => ['nullable', 'uuid', Rule::exists('businesses', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'warehouse_id' => ['nullable', 'uuid', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)],
            'rfq_number' => ['sometimes', 'string', 'max:50', Rule::unique('rfqs', 'rfq_number')->where('organization_id', $this->user()->organization_id)->ignore($rfqId)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published,closed,awarded,cancelled'],
            'submission_deadline' => ['nullable', 'date'],
            'delivery_required_date' => ['nullable', 'date'],
            'commercial_terms' => ['nullable', 'string'],
            'payment_terms' => ['nullable', 'string'],
            'tax_requirements' => ['nullable', 'string'],
            'evaluation_criteria' => ['nullable', 'array'],
            'custom_fields' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
