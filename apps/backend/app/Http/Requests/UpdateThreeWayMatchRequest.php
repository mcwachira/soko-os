<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateThreeWayMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_id' => ['nullable', 'uuid', Rule::exists('businesses', 'id')->where('organization_id', $this->user()->organization_id)],
            'purchase_order_id' => ['nullable', 'uuid', Rule::exists('purchase_orders', 'id')->where('organization_id', $this->user()->organization_id)],
            'grn_id' => ['nullable', 'uuid', Rule::exists('goods_received_notes', 'id')->where('organization_id', $this->user()->organization_id)],
            'supplier_invoice_id' => ['nullable', 'uuid', Rule::exists('supplier_invoices', 'id')->where('organization_id', $this->user()->organization_id)],
            'status' => ['nullable', 'string', 'in:pending,matched,mismatched,cancelled'],
            'mismatches' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
