<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'uuid', Rule::exists('payments', 'id')->where('organization_id', $this->user()->organization_id)],
            'allocatable_type' => ['required', 'string', Rule::in([\App\Models\Invoice::class, \App\Models\Bill::class])],
            'allocatable_id' => ['required', 'uuid'],
            'allocated_minor' => ['required', 'integer', 'min:1'],
        ];
    }
}
