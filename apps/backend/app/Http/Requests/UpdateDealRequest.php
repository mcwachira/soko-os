<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'nullable|uuid|exists:accounts,id',
            'contact_id' => 'nullable|uuid|exists:contacts,id',
            'pipeline_id' => 'nullable|uuid|exists:pipelines,id',
            'stage_id' => 'nullable|uuid|exists:deal_stages,id',
            'owner_user_id' => 'nullable|uuid|exists:users,id',
            'deal_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'currency' => 'nullable|string|max:3',
            'value_minor' => 'nullable|integer|min:0',
            'probability_minor' => 'nullable|integer|min:0|max:1000000',
            'expected_close_date' => 'nullable|date',
            'status' => 'nullable|string|in:open,won,lost,abandoned,cancelled',
            'lost_reason' => 'nullable|string|max:500',
            'competitors' => 'nullable|string|max:500',
            'source_campaign' => 'nullable|string|max:255',
            'custom_fields' => 'nullable|array',
            'metadata' => 'nullable|array',
            'notes' => 'nullable|string',
        ];
    }
}
