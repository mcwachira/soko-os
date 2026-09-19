<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePriceOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sale_id' => ['nullable', 'uuid', 'exists:sales,id'],
            'sale_item_id' => ['required', 'uuid', 'exists:sale_items,id'],
            'new_price_minor' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', 'string'],
        ];
    }
}
