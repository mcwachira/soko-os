<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePipelineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'nullable|string|in:sales,retail,enterprise,services,renewals,partnerships',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
            'settings' => 'nullable|array',
        ];
    }
}
