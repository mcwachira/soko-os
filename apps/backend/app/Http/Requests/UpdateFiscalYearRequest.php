<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFiscalYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'is_current' => ['nullable', 'boolean'],
        ];
    }
}
