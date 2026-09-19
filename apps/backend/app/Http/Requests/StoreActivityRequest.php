<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => 'nullable|uuid|exists:businesses,id',
            'user_id' => 'nullable|uuid|exists:users,id',
            'activity_type' => 'nullable|string|in:task,call,meeting,email,note,visit,follow_up,whatsapp,sms',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'status' => 'nullable|string|in:pending,in_progress,completed,cancelled',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'metadata' => 'nullable|array',
            'links' => 'nullable|array',
            'links.*.linkable_type' => 'required_with:links|string|in:lead,account,contact,deal,case',
            'links.*.linkable_id' => 'required_with:links|uuid',
        ];
    }
}
