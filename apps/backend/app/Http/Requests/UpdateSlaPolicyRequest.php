<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSlaPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'applies_to_entity' => 'nullable|string|in:lead,deal,case',
            'sla_type' => 'nullable|string|in:first_response,next_response,resolution,follow_up',
            'threshold_minutes' => 'nullable|integer|min:0',
            'threshold_hours' => 'nullable|integer|min:0',
            'threshold_days' => 'nullable|integer|min:0',
            'business_hours' => 'nullable|array',
            'escalation_rules' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ];
    }
}
