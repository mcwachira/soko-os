<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadScoringRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'condition_type' => 'nullable|string|in:event,field_value,decay',
            'condition_field' => 'nullable|string|max:255',
            'condition_operator' => 'nullable|string|in:equals,contains,greater_than,less_than,changed',
            'condition_value' => 'nullable|array',
            'score_change' => 'nullable|integer',
            'is_decay' => 'nullable|boolean',
            'decay_after_hours' => 'nullable|integer|min:0',
            'decay_amount' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ];
    }
}
