<?php

namespace App\Policies;

use App\Models\Timesheet;
use App\Models\User;

class TimesheetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Timesheet $timesheet): bool
    {
        return $user->organization_id === $timesheet->organization_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Timesheet $timesheet): bool
    {
        return $user->organization_id === $timesheet->organization_id;
    }

    public function delete(User $user, Timesheet $timesheet): bool
    {
        return $user->organization_id === $timesheet->organization_id;
    }
}
