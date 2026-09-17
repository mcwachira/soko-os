<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSequenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'target_entity' => 'nullable|string|in:lead,contact,account',
            'status' => 'nullable|string|in:draft,active,paused,completed',
            'steps' => 'nullable|array',
            'settings' => 'nullable|array',
        ];
    }
}
