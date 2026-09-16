<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'account_number_masked' => ['nullable', 'string'],
            'bank_name' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'size:3'],
            'account_id' => ['nullable', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
        ];
    }
}
