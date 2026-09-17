<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'account_id' => 'nullable|uuid|exists:accounts,id',
            'lead_id' => 'nullable|uuid|exists:leads,id',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp_phone' => 'nullable|string|max:50',
            'preferred_channel' => 'nullable|string|in:email,phone,whatsapp,sms',
            'is_decision_maker' => 'nullable|boolean',
            'is_billing_contact' => 'nullable|boolean',
            'is_technical_contact' => 'nullable|boolean',
            'custom_fields' => 'nullable|array',
            'notes' => 'nullable|string',
        ];
    }
}
