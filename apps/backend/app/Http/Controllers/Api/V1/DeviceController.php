<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Device;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Device::class);

        $devices = Device::where('organization_id', $request->user()->organization_id)
            ->with(['terminal.branch', 'branch'])
            ->orderBy('last_seen_at', 'desc')
            ->paginate($request->integer('per_page', 50));

        return response()->json($devices);
    }

    public function show(string $id)
    {
        $device = Device::where('organization_id', request()->user()->organization_id)
            ->with(['terminal.branch', 'branch'])
            ->findOrFail($id);

        $this->authorize('view', $device);

        return response()->json(['data' => $device]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Device::class);

        $validated = $request->validate([
            'device_uuid' => 'required|string|max:255',
            'device_name' => 'nullable|string|max:255',
            'terminal_id' => 'nullable|uuid|exists:terminals,id',
        ]);

        $user = $request->user();

        $device = Device::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'terminal_id' => $validated['terminal_id'],
            'device_uuid' => $validated['device_uuid'],
            'device_name' => $validated['device_name'] ?? $validated['device_uuid'],
            'status' => 'pending',
        ]);

        return response()->json(['data' => $device], 201);
    }

    public function update(Request $request, string $id)
    {
        $device = Device::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $device);

        $validated = $request->validate([
            'device_name' => 'sometimes|string|max:255',
            'terminal_id' => ['sometimes', 'nullable', 'uuid', 'exists:terminals,id'],
            'status' => 'sometimes|in:pending,approved,disabled,revoked',
        ]);

        $device->update($validated);

        return response()->json(['data' => $device->load('terminal.branch')]);
    }

    public function destroy(string $id)
    {
        $device = Device::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $device);

        $device->delete();

        return response()->json(['message' => 'Device deleted']);
    }
}
