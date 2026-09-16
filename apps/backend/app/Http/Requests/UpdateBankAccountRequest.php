<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string'],
            'account_number_masked' => ['nullable', 'string'],
            'bank_name' => ['nullable', 'string'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'account_id' => ['nullable', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
        ];
    }
}
