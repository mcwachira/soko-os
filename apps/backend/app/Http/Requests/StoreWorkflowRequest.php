<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'trigger_entity' => 'nullable|string|in:lead,deal,quote,invoice,payment,case,account,contact',
            'trigger_event' => 'nullable|string|in:created,updated,field_changed,stage_changed,converted,accepted,paid',
            'trigger_conditions' => 'nullable|array',
            'actions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
        ];
    }
}
