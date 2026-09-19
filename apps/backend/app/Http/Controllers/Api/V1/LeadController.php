<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Lead::class);

        $query = Lead::where('organization_id', $request->user()->organization_id)
            ->with(['assignedTo', 'business', 'branch']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('company_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to_user_id', $request->assigned_to);
        }

        $leads = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($leads);
    }

    public function show(string $id)
    {
        $lead = Lead::where('organization_id', request()->user()->organization_id)
            ->with(['assignedTo', 'business', 'branch', 'communications', 'activities'])
            ->findOrFail($id);

        $this->authorize('view', $lead);

        return response()->json(['data' => $lead]);
    }

    public function store(StoreLeadRequest $request)
    {
        $this->authorize('create', Lead::class);

        $user = $request->user();
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $user) {
            $lead = Lead::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $validated['business_id'] ?? $user->business_id,
                'branch_id' => $validated['branch_id'] ?? null,
                'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? null,
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
                'company_name' => $validated['company_name'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'whatsapp_phone' => $validated['whatsapp_phone'] ?? $validated['phone'] ?? null,
                'source' => $validated['source'] ?? 'manual',
                'status' => $validated['status'] ?? 'new',
                'lifecycle_stage' => $validated['lifecycle_stage'] ?? 'lead',
                'score' => $validated['score'] ?? 0,
                'custom_fields' => $validated['custom_fields'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Record assignment if assigned
            if ($lead->assigned_to_user_id) {
                \App\Models\CrmAuditLog::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $lead->organization_id,
                    'user_id' => $user->id,
                    'entity_type' => 'lead',
                    'entity_id' => $lead->id,
                    'action' => 'assigned',
                    'new_values' => ['assigned_to_user_id' => $lead->assigned_to_user_id],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

            return response()->json(['data' => $lead->load('assignedTo', 'business', 'branch')], 201);
        });
    }

    public function update(UpdateLeadRequest $request, string $id)
    {
        $lead = Lead::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $lead);

        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $lead, $request) {
            $oldValues = $lead->only(array_keys($validated));

            $lead->update($validated);

            \App\Models\CrmAuditLog::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $lead->organization_id,
                'user_id' => $request->user()->id,
                'entity_type' => 'lead',
                'entity_id' => $lead->id,
                'action' => 'updated',
                'old_values' => $oldValues,
                'new_values' => $validated,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['data' => $lead->load('assignedTo', 'business', 'branch')]);
        });
    }

    public function destroy(string $id)
    {
        $lead = Lead::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $lead);

        $lead->delete();

        return response()->json(['message' => 'Lead deleted']);
    }

    public function convert(Request $request, string $id)
    {
        $lead = Lead::where('organization_id', $request->user()->organization_id)
            ->with(['business', 'branch'])
            ->findOrFail($id);

        $this->authorize('update', $lead);

        if ($lead->status === 'converted') {
            return response()->json(['message' => 'Lead has already been converted'], 422);
        }

        $validated = $request->validate([
            'account_type' => 'nullable|string|in:customer,prospect,partner,distributor,reseller,government,ngo',
            'create_contact' => 'nullable|boolean',
            'create_deal' => 'nullable|boolean',
            'pipeline_id' => 'nullable|string|exists:pipelines,id',
            'stage_id' => 'nullable|string|exists:deal_stages,id',
            'deal_value_minor' => 'nullable|integer|min:0',
            'deal_name' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($lead, $validated, $request) {
            $account = \App\Models\CrmAccount::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $lead->organization_id,
                'business_id' => $lead->business_id,
                'account_type' => $validated['account_type'] ?? 'prospect',
                'legal_name' => $lead->company_name,
                'trading_name' => $lead->company_name,
                'phone' => $lead->phone,
                'email' => $lead->email,
                'custom_fields' => $lead->custom_fields,
            ]);

            $contact = null;
            if ($validated['create_contact'] ?? true) {
                $contact = \App\Models\Contact::create([
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $lead->organization_id,
                    'business_id' => $lead->business_id,
                    'account_id' => $account->id,
                    'lead_id' => $lead->id,
                    'first_name' => $lead->first_name,
                    'last_name' => $lead->last_name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'whatsapp_phone' => $lead->whatsapp_phone,
                ]);
            }

            $deal = null;
            if ($validated['create_deal'] ?? false) {
                $pipeline = \App\Models\Pipeline::where('organization_id', $lead->organization_id)
                    ->where('is_default', true)
                    ->first();

                $stage = null;
                if ($validated['stage_id']) {
                    $stage = \App\Models\DealStage::findOrFail($validated['stage_id']);
                } elseif ($pipeline) {
                    $stage = $pipeline->stages()->orderBy('position')->first();
                }

                if ($stage) {
                    $deal = \App\Models\Deal::create([
                        'id' => Str::uuid()->toString(),
                        'organization_id' => $lead->organization_id,
                        'business_id' => $lead->business_id,
                        'account_id' => $account->id,
                        'contact_id' => $contact?->id,
                        'pipeline_id' => $pipeline?->id,
                        'stage_id' => $stage->id,
                        'owner_user_id' => $lead->assigned_to_user_id,
                        'lead_id' => $lead->id,
                        'deal_name' => $validated['deal_name'] ?? ($lead->company_name ?? 'New Deal'),
                        'value_minor' => $validated['deal_value_minor'] ?? 0,
                        'stage_entered_at' => now(),
                    ]);
                }
            }

            $lead->update([
                'status' => 'converted',
                'converted_at' => now(),
                'converted_by_user_id' => $request->user()->id,
            ]);

            return response()->json([
                'data' => [
                    'lead' => $lead,
                    'account' => $account->load('owner'),
                    'contact' => $contact,
                    'deal' => $deal,
                ]
            ], 201);
        });
    }
}
