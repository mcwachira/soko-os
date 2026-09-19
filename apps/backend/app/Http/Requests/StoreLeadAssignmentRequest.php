<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rule_name' => 'required|string|max:255',
            'assignment_type' => 'nullable|string|in:round_robin,territory,branch,product,industry,source,weighted,manual',
            'criteria' => 'nullable|array',
            'assignees' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ];
    }
}
