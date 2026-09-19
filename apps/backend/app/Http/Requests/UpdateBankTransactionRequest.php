<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_account_id' => ['sometimes', 'uuid', Rule::exists('bank_accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'type' => ['sometimes', 'string', Rule::in(['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'other'])],
            'direction' => ['sometimes', 'string', Rule::in(['in', 'out'])],
            'amount_minor' => ['sometimes', 'integer', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'reference' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'transaction_date' => ['sometimes', 'date'],
            'counterparty' => ['nullable', 'string', 'max:255'],
            'source' => ['sometimes', 'string', 'max:255'],
            'external_id' => ['nullable', 'string', 'max:255'],
            'reconciled' => ['sometimes', 'boolean'],
        ];
    }
}
