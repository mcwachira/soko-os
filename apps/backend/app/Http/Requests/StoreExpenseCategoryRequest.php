<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:expense_categories,code,NULL,id,organization_id,'.$this->user()->organization_id],
            'account_id' => ['nullable', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
