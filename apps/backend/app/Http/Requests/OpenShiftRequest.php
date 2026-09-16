<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpenShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'terminal_id' => ['required', 'uuid', Rule::exists('terminals', 'id')->where('is_active', true)],
            'opening_float_minor' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
