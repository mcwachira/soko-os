<?php

namespace App\Policies;

use App\Models\JournalEntry;
use App\Models\User;

class JournalEntryPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('journals.view') || $user->hasPermission('books.access');
    }

    public function view(User $user, JournalEntry $journalEntry): bool
    {
        if ($user->hasPermission('journals.view') || $user->hasPermission('books.access')) {
            return $user->organization_id === $journalEntry->organization_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('journals.create') || $user->hasPermission('books.access');
    }

    public function update(User $user, JournalEntry $journalEntry): bool
    {
        return $user->hasPermission('journals.update')
            && $user->organization_id === $journalEntry->organization_id;
    }

    public function delete(User $user, JournalEntry $journalEntry): bool
    {
        return $user->hasPermission('journals.delete')
            && $user->organization_id === $journalEntry->organization_id;
    }

    public function post(User $user, JournalEntry $journalEntry): bool
    {
        return $user->hasPermission('journals.post')
            && $user->organization_id === $journalEntry->organization_id;
    }

    public function reverse(User $user, JournalEntry $journalEntry): bool
    {
        return $user->hasPermission('journals.reverse')
            && $user->organization_id === $journalEntry->organization_id;
    }
}
