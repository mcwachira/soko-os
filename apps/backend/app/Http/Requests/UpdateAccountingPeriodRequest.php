<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountingPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fiscal_year_id' => ['nullable', 'uuid', Rule::exists('fiscal_years', 'id')->where('organization_id', $this->user()->organization_id)],
            'name' => ['sometimes', 'string'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
        ];
    }
}
