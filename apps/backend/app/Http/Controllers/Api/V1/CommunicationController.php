<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Communication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunicationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Communication::class);

        $query = Communication::where('organization_id', $request->user()->organization_id)
            ->with(['business']);

        if ($request->has('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->has('direction')) {
            $query->where('direction', $request->direction);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $communications = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($communications);
    }

    public function show(string $id)
    {
        $communication = Communication::where('organization_id', request()->user()->organization_id)
            ->with(['business'])
            ->findOrFail($id);

        $this->authorize('view', $communication);

        return response()->json(['data' => $communication]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Communication::class);

        $user = $request->user();
        $validated = $request->validate([
            'channel' => 'required|string|in:email,whatsapp,sms,phone,web,social',
            'direction' => 'required|string|in:inbound,outbound',
            'status' => 'nullable|string|in:received,sent,delivered,read,failed',
            'from_address' => 'nullable|string|max:255',
            'to_address' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'attachments' => 'nullable|array',
            'metadata' => 'nullable|array',
            'external_id' => 'nullable|string|max:255',
            'sent_at' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'read_at' => 'nullable|date',
            'links' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $user) {
            $communication = Communication::create([
                'id' => Str::uuid()->toString(),
                'organization_id' => $user->organization_id,
                'business_id' => $validated['business_id'] ?? $user->business_id,
                'channel' => $validated['channel'],
                'direction' => $validated['direction'],
                'status' => $validated['status'] ?? 'received',
                'from_address' => $validated['from_address'] ?? null,
                'to_address' => $validated['to_address'] ?? null,
                'subject' => $validated['subject'] ?? null,
                'body' => $validated['body'] ?? null,
                'attachments' => $validated['attachments'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'external_id' => $validated['external_id'] ?? null,
                'sent_at' => $validated['sent_at'] ?? null,
                'delivered_at' => $validated['delivered_at'] ?? null,
                'read_at' => $validated['read_at'] ?? null,
            ]);

            if (isset($validated['links']) && is_array($validated['links'])) {
                foreach ($validated['links'] as $link) {
                    \App\Models\CommunicationLink::create([
                        'id' => Str::uuid()->toString(),
                        'communication_id' => $communication->id,
                        'linkable_type' => $link['linkable_type'],
                        'linkable_id' => $link['linkable_id'],
                    ]);
                }
            }

            return response()->json(['data' => $communication], 201);
        });
    }
}
