<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncPullRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_id' => ['required', 'string', 'max:255'],
            'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'since_cursor' => ['nullable', 'string'],
            'entities' => ['nullable', 'array'],
            'entities.*' => ['string', Rule::in(['products', 'categories', 'customers', 'tax_rules', 'branch_config'])],
            'limit' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
