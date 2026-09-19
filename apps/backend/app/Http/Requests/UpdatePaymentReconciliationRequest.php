<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_payment_id' => ['nullable', 'uuid', Rule::exists('supplier_payments', 'id')->where('organization_id', $this->user()->organization_id)],
            'provider_transaction_id' => ['nullable', 'string', 'max:100'],
            'amount_minor' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'reconciled_at' => ['nullable', 'date'],
            'reconciled_by_user_id' => ['nullable', 'uuid', Rule::exists('users', 'id')],
            'status' => ['nullable', 'string', 'in:pending,reconciled,discrepancy,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
