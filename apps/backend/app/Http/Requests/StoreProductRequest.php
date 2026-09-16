<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'uuid', Rule::exists('categories', 'id')->where('organization_id', $this->user()->organization_id)],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products')->where('organization_id', $this->user()->organization_id)],
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('products')->where('organization_id', $this->user()->organization_id)->ignoreNull()],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'tax_category_code' => ['nullable', 'string', 'max:10'],
            'unit' => ['nullable', 'string', 'max:50'],
            'cost_price_minor' => ['required', 'integer', 'min:0'],
            'selling_price_minor' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'track_inventory' => ['boolean'],
        ];
    }
}
