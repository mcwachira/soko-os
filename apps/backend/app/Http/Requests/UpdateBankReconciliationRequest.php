<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_account_id' => ['sometimes', 'uuid', Rule::exists('bank_accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'fiscal_year_id' => ['nullable', 'uuid', Rule::exists('fiscal_years', 'id')->where('organization_id', $this->user()->organization_id)],
            'accounting_period_id' => ['nullable', 'uuid', Rule::exists('accounting_periods', 'id')->where('organization_id', $this->user()->organization_id)],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'statement_opening_balance_minor' => ['sometimes', 'integer'],
            'statement_closing_balance_minor' => ['sometimes', 'integer'],
            'book_closing_balance_minor' => ['sometimes', 'integer'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'in_progress', 'completed', 'discrepancy'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
