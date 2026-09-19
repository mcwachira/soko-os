<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Contact::class);

        $query = Contact::where('organization_id', $request->user()->organization_id)
            ->with(['account', 'lead', 'business']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        $contacts = $query->orderBy('last_name')
            ->paginate($request->integer('per_page', 25));

        return response()->json($contacts);
    }

    public function show(string $id)
    {
        $contact = Contact::where('organization_id', request()->user()->organization_id)
            ->with(['account', 'lead', 'business'])
            ->findOrFail($id);

        $this->authorize('view', $contact);

        return response()->json(['data' => $contact]);
    }

    public function store(StoreContactRequest $request)
    {
        $this->authorize('create', Contact::class);

        $user = $request->user();
        $validated = $request->validated();

        $contact = Contact::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $validated['business_id'] ?? $user->business_id,
            'account_id' => $validated['account_id'] ?? null,
            'lead_id' => $validated['lead_id'] ?? null,
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
            'department' => $validated['department'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'whatsapp_phone' => $validated['whatsapp_phone'] ?? $validated['phone'] ?? null,
            'preferred_channel' => $validated['preferred_channel'] ?? 'email',
            'is_decision_maker' => $validated['is_decision_maker'] ?? false,
            'is_billing_contact' => $validated['is_billing_contact'] ?? false,
            'is_technical_contact' => $validated['is_technical_contact'] ?? false,
            'custom_fields' => $validated['custom_fields'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['data' => $contact->load('account', 'lead', 'business')], 201);
    }

    public function update(UpdateContactRequest $request, string $id)
    {
        $contact = Contact::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $contact);

        $validated = $request->validated();

        $contact->update($validated);

        return response()->json(['data' => $contact->load('account', 'lead', 'business')]);
    }

    public function destroy(string $id)
    {
        $contact = Contact::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json(['message' => 'Contact deleted']);
    }
}
