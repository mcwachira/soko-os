<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
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
            'type' => 'nullable|string|in:marketing,sales,nurture,event',
            'status' => 'nullable|string|in:draft,scheduled,active,paused,completed,cancelled',
            'channel' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget_minor' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|max:3',
            'utm_parameters' => 'nullable|array',
            'target_audience' => 'nullable|array',
            'description' => 'nullable|string|max:2000',
        ];
    }
}
