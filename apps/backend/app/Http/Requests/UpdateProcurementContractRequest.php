<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProcurementContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $contractId = $this->route('contract');

        return [
            'business_id' => ['nullable', 'uuid', Rule::exists('businesses', 'id')->where('organization_id', $this->user()->organization_id)],
            'supplier_id' => ['nullable', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'contract_number' => ['sometimes', 'string', 'max:50', Rule::unique('procurement_contracts', 'contract_number')->where('organization_id', $this->user()->organization_id)->ignore($contractId)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'renewal_date' => ['nullable', 'date'],
            'contract_value_minor' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'terms' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,active,expired,terminated,renewed'],
            'attachment_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
