<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCrmAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'parent_account_id' => 'nullable|uuid|exists:accounts,id',
            'owner_user_id' => 'nullable|uuid|exists:users,id',
            'account_type' => 'nullable|string|in:customer,prospect,partner,distributor,reseller,government,ngo',
            'legal_name' => 'required|string|max:255',
            'trading_name' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'kra_pin' => 'nullable|string|max:50',
            'industry' => 'nullable|string|max:255',
            'country_code' => 'nullable|string|max:2',
            'county' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'credit_limit_minor' => 'nullable|integer|min:0',
            'payment_terms' => 'nullable|string|max:255',
            'price_list' => 'nullable|string|max:255',
            'custom_fields' => 'nullable|array',
            'notes' => 'nullable|string',
        ];
    }
}
