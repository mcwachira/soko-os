<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierPaymentRequest extends FormRequest
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
            'payment_voucher_id' => ['nullable', 'uuid', Rule::exists('payment_vouchers', 'id')->where('organization_id', $this->user()->organization_id)],
            'supplier_id' => ['required', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'currency' => ['nullable', 'string', 'max:3'],
            'amount_minor' => ['required', 'integer', 'min:0'],
            'payment_method' => ['required', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'external_transaction_id' => ['nullable', 'string', 'max:100'],
            'provider_response' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:pending,processing,completed,failed,cancelled'],
            'paid_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
