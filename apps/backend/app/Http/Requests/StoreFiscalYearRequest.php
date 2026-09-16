<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFiscalYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'is_current' => ['nullable', 'boolean'],
        ];
    }
}
