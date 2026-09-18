<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EtimsStockSubmission;
use App\Models\User;
use Illuminate\Http\Request;

class EtimsController extends Controller
{
    public function index(Request $request, User $user)
    {
        $query = EtimsStockSubmission::where('organization_id', $user->organization_id);
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }
        if ($request->filled('submission_status')) {
            $query->where('submission_status', $request->submission_status);
        }
        return response()->json($query->get());
    }

    public function show(EtimsStockSubmission $submission, User $user)
    {
        $this->authorize('view', $submission);
        return response()->json($submission);
    }

    public function retry(Request $request, EtimsStockSubmission $submission, User $user)
    {
        $this->authorize('update', $submission);
        $submission->update([
            'submission_status' => 'retrying',
            'attempt_count' => $submission->attempt_count + 1,
            'last_attempt_at' => now(),
        ]);
        return response()->json($submission);
    }
}
