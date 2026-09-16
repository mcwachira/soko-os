<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Permission::class);

        $permissions = Permission::where('organization_id', $request->user()->organization_id)
            ->orderBy('group')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $permissions]);
    }
}
