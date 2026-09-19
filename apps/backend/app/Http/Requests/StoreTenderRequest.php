<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTenderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => ['nullable', 'uuid', Rule::exists('businesses', 'id')->where('organization_id', $this->user()->organization_id)],
            'branch_id' => ['nullable', 'uuid', Rule::exists('branches', 'id')->where('organization_id', $this->user()->organization_id)],
            'tender_number' => ['required', 'string', 'max:50', Rule::unique('tenders', 'tender_number')->where('organization_id', $this->user()->organization_id)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published,closed,evaluated,awarded,cancelled'],
            'submission_deadline' => ['nullable', 'date'],
            'opening_date' => ['nullable', 'date'],
            'evaluation_criteria' => ['nullable', 'array'],
            'custom_fields' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
