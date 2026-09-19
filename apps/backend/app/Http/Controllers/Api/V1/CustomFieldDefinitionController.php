<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CustomFieldDefinition;
use App\Http\Requests\StoreCustomFieldDefinitionRequest;
use App\Http\Requests\UpdateCustomFieldDefinitionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomFieldDefinitionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', CustomFieldDefinition::class);

        $query = CustomFieldDefinition::where('organization_id', $request->user()->organization_id);

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $fields = $query->orderBy('position')
            ->paginate($request->integer('per_page', 50));

        return response()->json($fields);
    }

    public function show(string $id)
    {
        $field = CustomFieldDefinition::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('view', $field);

        return response()->json(['data' => $field]);
    }

    public function store(StoreCustomFieldDefinitionRequest $request)
    {
        $this->authorize('create', CustomFieldDefinition::class);

        $user = $request->user();
        $validated = $request->validated();

        $field = CustomFieldDefinition::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'entity_type' => $validated['entity_type'],
            'field_name' => $validated['field_name'],
            'field_label' => $validated['field_label'],
            'field_type' => $validated['field_type'] ?? 'text',
            'options' => $validated['options'] ?? null,
            'is_required' => $validated['is_required'] ?? false,
            'is_unique' => $validated['is_unique'] ?? false,
            'default_value' => $validated['default_value'] ?? null,
            'validation_rules' => $validated['validation_rules'] ?? null,
            'position' => $validated['position'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['data' => $field], 201);
    }

    public function update(UpdateCustomFieldDefinitionRequest $request, string $id)
    {
        $field = CustomFieldDefinition::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $field);

        $validated = $request->validated();

        $field->update($validated);

        return response()->json(['data' => $field]);
    }

    public function destroy(string $id)
    {
        $field = CustomFieldDefinition::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $field);

        $field->delete();

        return response()->json(['message' => 'Custom field deleted']);
    }
}
