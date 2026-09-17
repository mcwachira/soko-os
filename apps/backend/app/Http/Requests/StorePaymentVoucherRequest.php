<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentVoucherRequest extends FormRequest
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
            'voucher_number' => ['required', 'string', 'max:50', Rule::unique('payment_vouchers', 'voucher_number')->where('organization_id', $this->user()->organization_id)],
            'supplier_id' => ['required', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'currency' => ['nullable', 'string', 'max:3'],
            'gross_amount_minor' => ['required', 'integer', 'min:0'],
            'wht_rate_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'wht_amount_minor' => ['nullable', 'integer', 'min:0'],
            'other_deductions_minor' => ['nullable', 'integer', 'min:0'],
            'net_payable_minor' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,submitted,approved,rejected,paid,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
