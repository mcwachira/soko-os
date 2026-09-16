<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => ['nullable', 'string', 'max:255'],
            'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'terminal_id' => ['nullable', 'uuid', Rule::exists('terminals', 'id')->where('organization_id', $this->user()->organization_id)],
            'customer_id' => ['nullable', 'uuid', Rule::exists('customers', 'id')->where('organization_id', $this->user()->organization_id)],
            'shift_id' => ['nullable', 'uuid', Rule::exists('cash_shifts', 'id')->where('organization_id', $this->user()->organization_id)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'uuid', Rule::exists('products', 'id')->where('organization_id', $this->user()->organization_id)],
            'items.*.sku' => ['required', 'string', 'max:100'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price_minor' => ['required', 'integer', 'min:0'],
            'items.*.discount_minor' => ['nullable', 'integer', 'min:0'],
            'items.*.tax_rate_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.amount_minor' => ['required', 'integer', 'gt:0'],
            'payments.*.payment_method' => ['required', 'string', Rule::in(['cash', 'card', 'mpesa', 'airtel', 'bank', 'credit', 'points'])],
            'payments.*.reference' => ['nullable', 'string'],
            'payments.*.phone_number' => ['nullable', 'string'],
            'discount_minor' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.exists' => 'The selected branch does not belong to your organization.',
            'terminal_id.exists' => 'The selected terminal does not belong to your organization.',
            'customer_id.exists' => 'The selected customer does not belong to your organization.',
            'shift_id.exists' => 'The selected shift does not belong to your organization.',
            'items.*.product_id.exists' => 'One or more products do not belong to your organization.',
        ];
    }
}
