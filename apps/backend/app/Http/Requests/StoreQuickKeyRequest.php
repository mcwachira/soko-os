<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuickKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'uuid', 'exists:branches,id'],
            'terminal_id' => ['nullable', 'uuid', 'exists:terminals,id'],
            'name' => ['required', 'string', 'max:255'],
            'action_type' => ['required', 'string', 'in:product,variant,service,custom'],
            'action_data' => ['required', 'array'],
            'color' => ['nullable', 'string', 'max:7'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
