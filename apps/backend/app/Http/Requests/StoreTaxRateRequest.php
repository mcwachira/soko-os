<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'code' => ['required', 'string'],
            'rate_percentage' => ['required', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
