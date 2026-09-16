<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sale_id' => ['required', 'uuid', Rule::exists('sales', 'id')->where('organization_id', $this->user()->organization_id)],
            'shift_id' => ['nullable', 'uuid', Rule::exists('cash_shifts', 'id')->where('organization_id', $this->user()->organization_id)],
            'terminal_id' => ['nullable', 'uuid', Rule::exists('terminals', 'id')->where('organization_id', $this->user()->organization_id)],
            'return_type' => ['required', Rule::in(['refund', 'exchange', 'store_credit'])],
            'reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sale_item_id' => ['required', 'uuid', Rule::exists('sale_items', 'id')->where('organization_id', $this->user()->organization_id)],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.return_reason' => ['nullable', 'string', Rule::in(['defective', 'wrong_item', 'changed_mind', 'damaged', 'expired', 'other'])],
            'items.*.condition' => ['nullable', 'string', Rule::in(['good', 'damaged', 'expired'])],
        ];
    }

    public function messages(): array
    {
        return [
            'sale_id.exists' => 'The selected sale does not belong to your organization.',
            'items.*.sale_item_id.exists' => 'One or more sale items do not belong to your organization.',
        ];
    }
}
