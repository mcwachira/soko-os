<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
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
            'payment_type' => ['required', 'string', Rule::in(['sale', 'refund', 'expense', 'bill', 'invoice'])],
            'reference_type' => ['nullable', 'string', Rule::in(['invoice', 'bill', 'expense', 'sale'])],
            'reference_id' => ['nullable', 'uuid'],
            'amount_minor' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'payment_method' => ['required', 'string', Rule::in(['cash', 'card', 'mpesa', 'airtel', 'bank', 'credit', 'points'])],
            'reference' => ['nullable', 'string', 'max:255'],
            'external_transaction_id' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'provider_response' => ['nullable', 'array'],
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
