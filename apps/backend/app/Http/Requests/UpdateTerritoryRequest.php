<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTerritoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|string|in:region,county,district,zone',
            'country_code' => 'nullable|string|max:2',
            'parent_territory_id' => 'nullable|uuid|exists:territories,id',
            'metadata' => 'nullable|array',
        ];
    }
}
