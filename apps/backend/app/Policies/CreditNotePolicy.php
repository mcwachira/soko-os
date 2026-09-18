<?php

namespace App\Policies;

use App\Models\CreditNote;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CreditNotePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CreditNote $creditNote): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CreditNote $creditNote): bool
    {
        return true;
    }

    public function delete(User $user, CreditNote $creditNote): bool
    {
        return true;
    }
}
