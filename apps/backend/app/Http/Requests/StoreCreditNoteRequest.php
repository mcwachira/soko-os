<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCreditNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'uuid', Rule::exists('customers', 'id')->where('organization_id', $this->user()->organization_id)],
            'invoice_id' => ['nullable', 'uuid', Rule::exists('invoices', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'credit_date' => ['required', 'date'],
            'currency' => ['required', 'string', 'size:3'],
            'reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'uuid', Rule::exists('products', 'id')->where('organization_id', $this->user()->organization_id)],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price_minor' => ['required', 'integer', 'min:0'],
            'items.*.discount_minor' => ['nullable', 'integer', 'min:0'],
            'items.*.tax_rate_percentage' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
