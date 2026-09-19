<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceBookRequest extends FormRequest
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
            'type' => 'nullable|string|in:retail,wholesale,distributor,vip,enterprise,customer_specific,promotional',
            'currency' => 'nullable|string|max:3',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ];
    }
}
