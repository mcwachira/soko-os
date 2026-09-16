<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'category_id' => ['nullable', 'uuid', Rule::exists('categories', 'id')->where('organization_id', $this->user()->organization_id)],
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products')->where('organization_id', $this->user()->organization_id)->ignore($productId)],
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('products')->where('organization_id', $this->user()->organization_id)->ignore($productId)->ignoreNull()],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'tax_category_code' => ['nullable', 'string', 'max:10'],
            'unit' => ['nullable', 'string', 'max:50'],
            'cost_price_minor' => ['sometimes', 'integer', 'min:0'],
            'selling_price_minor' => ['sometimes', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'track_inventory' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
