<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBankReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_account_id' => ['required', 'uuid', Rule::exists('bank_accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'statement_date' => ['required', 'date'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'statement_balance_minor' => ['required', 'integer'],
            'book_balance_minor' => ['required', 'integer'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
