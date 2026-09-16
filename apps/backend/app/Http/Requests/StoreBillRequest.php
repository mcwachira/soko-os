<?php

namespace App\Http\Requests;

use App\Models\AccountingPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'uuid', Rule::exists('suppliers', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'issue_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'currency' => ['required', 'string', 'size:3'],
            'discount_minor' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'uuid', Rule::exists('products', 'id')->where('organization_id', $this->user()->organization_id)],
            'items.*.description' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_cost_minor' => ['required', 'integer', 'min:0'],
            'items.*.discount_minor' => ['nullable', 'integer', 'min:0'],
            'items.*.tax_rate_percentage' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $date = $this->input('issue_date');
            if ($date && $this->isPeriodLocked($date)) {
                $validator->errors()->add('issue_date', 'Cannot create bill in a closed accounting period.');
            }
        });
    }

    private function isPeriodLocked(string $date): bool
    {
        $period = AccountingPeriod::forDate($date, $this->user()->organization_id)->first();
        return $period && in_array($period->status, ['closed', 'locked'], true);
    }
}
