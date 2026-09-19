<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('expense_categories', 'code')->ignore($categoryId)->where('organization_id', $this->user()->organization_id)],
            'account_id' => ['nullable', 'uuid', Rule::exists('accounts', 'id')->where('organization_id', $this->user()->organization_id)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
