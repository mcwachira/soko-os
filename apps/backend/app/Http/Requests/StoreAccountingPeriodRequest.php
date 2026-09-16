<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountingPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fiscal_year_id' => ['nullable', 'uuid', Rule::exists('fiscal_years', 'id')->where('organization_id', $this->user()->organization_id)],
            'name' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
        ];
    }
}
