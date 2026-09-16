<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Terminal;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TerminalController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Terminal::class);

        $terminals = Terminal::where('organization_id', $request->user()->organization_id)
            ->with('branch')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 50));

        return response()->json($terminals);
    }

    public function show(string $id)
    {
        $terminal = Terminal::where('organization_id', request()->user()->organization_id)
            ->with('branch')
            ->findOrFail($id);

        $this->authorize('view', $terminal);

        return response()->json(['data' => $terminal]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Terminal::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'terminal_code' => 'required|string|max:50',
            'branch_id' => 'required|uuid|exists:branches,id',
        ]);

        $user = $request->user();

        $terminal = Terminal::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'business_id' => $user->business_id,
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'terminal_code' => $validated['terminal_code'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $terminal->load('branch')], 201);
    }

    public function update(Request $request, string $id)
    {
        $terminal = Terminal::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $terminal);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'terminal_code' => 'sometimes|string|max:50',
            'branch_id' => ['sometimes', 'uuid', 'exists:branches,id'],
        ]);

        $terminal->update($validated);

        return response()->json(['data' => $terminal->load('branch')]);
    }

    public function destroy(string $id)
    {
        $terminal = Terminal::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $terminal);

        $terminal->delete();

        return response()->json(['message' => 'Terminal deleted']);
    }
}
