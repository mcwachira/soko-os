<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierInvoiceRequest extends FormRequest
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
            'supplier_id' => ['nullable', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'purchase_order_id' => ['nullable', 'uuid', Rule::exists('purchase_orders', 'id')->where('organization_id', $this->user()->organization_id)],
            'invoice_number' => ['sometimes', 'string', 'max:100'],
            'invoice_date' => ['sometimes', 'date'],
            'due_date' => ['nullable', 'date'],
            'currency' => ['nullable', 'string', 'max:3'],
            'subtotal_minor' => ['nullable', 'integer', 'min:0'],
            'discount_minor' => ['nullable', 'integer', 'min:0'],
            'tax_minor' => ['nullable', 'integer', 'min:0'],
            'wht_minor' => ['nullable', 'integer', 'min:0'],
            'grand_total_minor' => ['nullable', 'integer', 'min:0'],
            'etims_status' => ['nullable', 'string', 'max:50'],
            'etims_control_number' => ['nullable', 'string', 'max:100'],
            'etims_verified_at' => ['nullable', 'date'],
            'etims_payload' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:draft,submitted,approved,rejected,paid'],
            'custom_fields' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
