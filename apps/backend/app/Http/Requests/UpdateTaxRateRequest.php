<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string'],
            'code' => ['sometimes', 'string'],
            'rate_percentage' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
