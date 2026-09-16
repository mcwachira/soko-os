<?php

namespace App\Http\Requests;

use App\Models\AccountingPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBankTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_account_id' => ['required', 'uuid', Rule::exists('bank_accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'type' => ['required', 'string'],
            'direction' => ['required', Rule::in(['in', 'out'])],
            'transaction_date' => ['required', 'date'],
            'reference' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'counterparty' => ['nullable', 'string'],
            'amount_minor' => ['required', 'integer'],
            'currency' => ['required', 'string', 'size:3'],
            'source' => ['required', 'string'],
            'external_id' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $date = $this->input('transaction_date');
            if ($date && $this->isPeriodLocked($date)) {
                $validator->errors()->add('transaction_date', 'Cannot create bank transaction in a closed accounting period.');
            }
        });
    }

    private function isPeriodLocked(string $date): bool
    {
        $period = AccountingPeriod::forDate($date, $this->user()->organization_id)->first();
        return $period && in_array($period->status, ['closed', 'locked'], true);
    }
}
