<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResolveConflictRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resolution' => ['required', Rule::in(['server_wins', 'client_wins', 'merge'])],
            'merged_data' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'resolution.in' => 'Invalid resolution strategy. Must be one of: server_wins, client_wins, merge.',
        ];
    }
}
