<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'branch_id' => 'nullable|uuid|exists:branches,id',
            'assigned_to_user_id' => 'nullable|uuid|exists:users,id',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp_phone' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:50',
            'status' => 'nullable|string|in:new,contacted,qualified,unqualified,converted,discarded',
            'lifecycle_stage' => 'nullable|string|in:lead,marketing_qualified,sales_qualified,opportunity,customer',
            'score' => 'nullable|integer|min:0|max:1000',
            'custom_fields' => 'nullable|array',
            'notes' => 'nullable|string',
        ];
    }
}
