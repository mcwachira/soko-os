<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaseRequest extends FormRequest
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
            'deal_id' => 'nullable|uuid|exists:deals,id',
            'assigned_to_user_id' => 'nullable|uuid|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'status' => 'nullable|string|in:new,open,pending,resolved,closed,cancelled',
            'category' => 'nullable|string|max:255',
            'channel' => 'nullable|string|max:50',
            'custom_fields' => 'nullable|array',
            'resolution' => 'nullable|string|max:2000',
        ];
    }
}
