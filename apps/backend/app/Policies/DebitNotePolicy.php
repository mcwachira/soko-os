<?php

namespace App\Policies;

use App\Models\DebitNote;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DebitNotePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DebitNote $debitNote): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DebitNote $debitNote): bool
    {
        return true;
    }

    public function delete(User $user, DebitNote $debitNote): bool
    {
        return true;
    }
}
