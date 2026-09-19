<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'uuid', 'exists:branches,id'],
            'terminal_id' => ['nullable', 'uuid', 'exists:terminals,id'],
            'shift_id' => ['nullable', 'uuid', 'exists:cash_shifts,id'],
            'movement_type' => ['required', 'string', 'in:cash_in,cash_out,safe_drop,float'],
            'amount_minor' => ['required', 'integer', 'min:1'],
            'currency' => ['nullable', 'string', 'size:3'],
            'reference' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
