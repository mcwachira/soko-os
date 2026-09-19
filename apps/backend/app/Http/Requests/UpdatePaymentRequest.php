<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'uuid', Rule::exists('customers', 'id')->where('organization_id', $this->user()->organization_id)],
            'sale_id' => ['nullable', 'uuid', Rule::exists('sales', 'id')->where('organization_id', $this->user()->organization_id)],
            'payment_type' => ['sometimes', 'string', Rule::in(['sale', 'refund', 'expense', 'bill', 'invoice'])],
            'reference_type' => ['nullable', 'string', Rule::in(['invoice', 'bill', 'expense', 'sale'])],
            'reference_id' => ['nullable', 'uuid'],
            'amount_minor' => ['sometimes', 'integer', 'min:1'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'payment_method' => ['sometimes', 'string', Rule::in(['cash', 'card', 'mpesa', 'airtel', 'bank', 'credit', 'points'])],
            'reference' => ['nullable', 'string', 'max:255'],
            'external_transaction_id' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'provider_response' => ['nullable', 'array'],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'completed', 'failed', 'refunded'])],
        ];
    }

    public function prepareForValidation(): void
    {
        if ($this->has('provider_response') && is_string($this->provider_response)) {
            $this->merge([
                'provider_response' => json_decode($this->provider_response, true),
            ]);
        }
    }
}
