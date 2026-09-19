<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomFieldDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entity_type' => 'nullable|string|in:lead,account,contact,deal,case',
            'field_name' => 'nullable|string|max:255',
            'field_label' => 'nullable|string|max:255',
            'field_type' => 'nullable|string|in:text,number,date,select,multiselect,boolean,url,email,phone',
            'options' => 'nullable|array',
            'is_required' => 'nullable|boolean',
            'is_unique' => 'nullable|boolean',
            'default_value' => 'nullable|array',
            'validation_rules' => 'nullable|array',
            'position' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ];
    }
}
