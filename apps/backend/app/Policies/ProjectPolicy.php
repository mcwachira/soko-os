<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Gate;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $user->organization_id === $project->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        return $user->organization_id === $project->organization_id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->organization_id === $project->organization_id;
    }
}
