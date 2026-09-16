<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'return_id' => ['nullable', 'uuid', Rule::exists('returns', 'id')->where('organization_id', $this->user()->organization_id)],
            'sale_id' => ['required', 'uuid', Rule::exists('sales', 'id')->where('organization_id', $this->user()->organization_id)],
            'payment_id' => ['nullable', 'uuid', Rule::exists('payments', 'id')->where('organization_id', $this->user()->organization_id)],
            'customer_id' => ['nullable', 'uuid', Rule::exists('customers', 'id')->where('organization_id', $this->user()->organization_id)],
            'refund_method' => ['required', Rule::in(['cash', 'card', 'mpesa', 'airtel', 'bank', 'store_credit', 'original'])],
            'amount_minor' => ['required', 'integer', 'gt:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'reference' => ['nullable', 'string'],
            'reason' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.sale_item_id' => ['required', 'uuid', Rule::exists('sale_items', 'id')->where('organization_id', $this->user()->organization_id)],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'return_id.exists' => 'The selected return does not belong to your organization.',
            'sale_id.exists' => 'The selected sale does not belong to your organization.',
            'payment_id.exists' => 'The selected payment does not belong to your organization.',
            'customer_id.exists' => 'The selected customer does not belong to your organization.',
            'items.*.sale_item_id.exists' => 'One or more sale items do not belong to your organization.',
        ];
    }
}
