<?php

namespace App\Http\Requests;

use App\Models\AccountingPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string'],
            'expense_date' => ['sometimes', 'date'],
            'payment_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string'],
            'reference' => ['nullable', 'string'],
            'payee_name' => ['sometimes', 'string'],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'supplier_id' => ['nullable', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'expense_category_id' => ['nullable', 'uuid', Rule::exists('expense_categories', 'id')->where('organization_id', $this->user()->organization_id)],
            'account_id' => ['nullable', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'bank_account_id' => ['nullable', 'uuid', Rule::exists('bank_accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'amount_minor' => ['sometimes', 'integer', 'min:0'],
            'tax_minor' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $date = $this->input('expense_date');
            if ($date && $this->isPeriodLocked($date)) {
                $validator->errors()->add('expense_date', 'Cannot update expense in a closed accounting period.');
            }
        });
    }

    private function isPeriodLocked(string $date): bool
    {
        $period = AccountingPeriod::forDate($date, $this->user()->organization_id)->first();
        return $period && in_array($period->status, ['closed', 'locked'], true);
    }
}
