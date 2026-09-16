<?php

namespace App\Http\Requests;

use App\Models\AccountingPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entry_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'entry_type' => ['nullable', 'string'],
            'reference_type' => ['nullable', 'string'],
            'reference_id' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'lines.*.description' => ['nullable', 'string'],
            'lines.*.debit_minor' => ['required', 'integer', 'min:0'],
            'lines.*.credit_minor' => ['required', 'integer', 'min:0'],
            'lines.*.branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $date = $this->input('entry_date');
            if ($date && $this->isPeriodLocked($date)) {
                $validator->errors()->add('entry_date', 'Cannot create journal entry in a closed accounting period.');
            }
        });
    }

    private function isPeriodLocked(string $date): bool
    {
        $period = AccountingPeriod::forDate($date, $this->user()->organization_id)->first();
        return $period && in_array($period->status, ['closed', 'locked'], true);
    }
}
