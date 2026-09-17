<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['sometimes', 'uuid', Rule::exists('payments', 'id')->where('organization_id', $this->user()->organization_id)],
            'allocatable_type' => ['sometimes', 'string', Rule::in(['invoice', 'bill', 'expense', 'sale', 'credit_note', 'debit_note'])],
            'allocatable_id' => ['sometimes', 'uuid'],
            'allocated_minor' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
