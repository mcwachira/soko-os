<?php

namespace App\Policies;

use App\Models\CustomFieldDefinition;
use App\Models\User;

class CustomFieldDefinitionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.custom_fields.view') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function view(User $user, CustomFieldDefinition $field): bool
    {
        if ($user->hasPermission('crm.custom_fields.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $field->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.custom_fields.create') || $user->role === 'admin' || $user->role === 'sales_manager';
    }

    public function update(User $user, CustomFieldDefinition $field): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->hasPermission('crm.custom_fields.update') && $user->organization_id === $field->organization_id;
    }

    public function delete(User $user, CustomFieldDefinition $field): bool
    {
        return $user->hasPermission('crm.custom_fields.delete') || $user->role === 'admin';
    }
}
