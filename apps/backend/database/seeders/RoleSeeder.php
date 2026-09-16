<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $organization = Organization::first();

        if (! $organization) {
            $organization = Organization::create([
                'id' => Str::uuid()->toString(),
                'name' => 'Default Organization',
                'slug' => 'default',
                'tax_number' => 'N/A',
                'country_code' => 'KE',
                'currency' => 'KES',
            ]);
        }

        $organizationId = $organization->id;

        $permissions = [
            ['sales.view', 'View Sales', 'View sales list and details', 'sales'],
            ['sales.create', 'Create Sales', 'Create new sales', 'sales'],
            ['sales.update', 'Update Sales', 'Update sales', 'sales'],
            ['sales.refund', 'Refund Sales', 'Process refunds', 'sales'],

            ['inventory.view', 'View Inventory', 'View inventory movements', 'inventory'],
            ['inventory.create', 'Create Inventory', 'Create inventory records', 'inventory'],
            ['inventory.update', 'Update Inventory', 'Update inventory records', 'inventory'],
            ['inventory.adjust', 'Adjust Inventory', 'Adjust stock levels', 'inventory'],

            ['purchases.view', 'View Purchases', 'View purchase orders', 'purchasing'],
            ['purchases.create', 'Create Purchases', 'Create purchase orders', 'purchasing'],
            ['purchases.update', 'Update Purchases', 'Update purchase orders', 'purchasing'],

            ['accounting.view', 'View Accounting', 'View accounts and journal entries', 'accounting'],
            ['accounting.create', 'Create Accounting', 'Create journal entries', 'accounting'],
            ['accounting.update', 'Update Accounting', 'Update accounting records', 'accounting'],

            ['reports.view', 'View Reports', 'View reports dashboard', 'reports'],
            ['reports.export', 'Export Reports', 'Export reports to PDF/CSV', 'reports'],

            ['settings.view', 'View Settings', 'View system settings', 'settings'],
            ['settings.update', 'Update Settings', 'Update system settings', 'settings'],

            ['sync.view', 'View Sync', 'View sync status', 'sync'],
            ['sync.push', 'Push Sync', 'Push data to server', 'sync'],
            ['sync.pull', 'Pull Sync', 'Pull data to server', 'sync'],
            ['sync.conflicts', 'Resolve Sync Conflicts', 'Resolve sync conflicts', 'sync'],

            ['tax.view', 'View Tax', 'View tax submissions', 'tax'],
            ['tax.submit', 'Submit Tax', 'Submit tax returns', 'tax'],
            ['tax.manage', 'Manage Tax', 'Manage tax configurations', 'tax'],
        ];

        $seededPermissions = [];
        foreach ($permissions as [$slug, $name, $description, $group]) {
            $seededPermissions[$slug] = Permission::updateOrCreate(
                ['slug' => $slug, 'organization_id' => $organizationId],
                ['id' => Str::uuid()->toString(), 'name' => $name, 'description' => $description, 'group' => $group, 'organization_id' => $organizationId]
            );
        }

        $roles = [
            'owner' => ['*', 'settings.view', 'settings.update', 'tax.manage'],
            'admin' => ['sales.view', 'sales.create', 'sales.update', 'sales.refund', 'inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'purchases.view', 'purchases.create', 'purchases.update', 'accounting.view', 'accounting.create', 'accounting.update', 'reports.view', 'reports.export', 'settings.view', 'sync.view', 'sync.push', 'sync.pull', 'sync.conflicts', 'tax.view', 'tax.submit'],
            'manager' => ['sales.view', 'sales.create', 'sales.update', 'sales.refund', 'inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'purchases.view', 'purchases.create', 'purchases.update', 'accounting.view', 'reports.view', 'reports.export', 'sync.view'],
            'cashier' => ['sales.view', 'sales.create', 'sales.update', 'inventory.view', 'reports.view'],
            'accountant' => ['sales.view', 'accounting.view', 'accounting.create', 'accounting.update', 'reports.view', 'reports.export', 'tax.view', 'tax.submit'],
            'inventory_manager' => ['inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'purchases.view', 'purchases.create', 'purchases.update', 'reports.view'],
            'auditor' => ['sales.view', 'inventory.view', 'purchases.view', 'accounting.view', 'reports.view', 'reports.export', 'tax.view', 'sync.view'],
        ];

        foreach ($roles as $slug => $permissionSlugs) {
            $permissionsData = [];

            foreach ($permissionSlugs as $permissionSlug) {
                if ($permissionSlug === '*' || isset($seededPermissions[$permissionSlug])) {
                    $permissionsData[] = $permissionSlug;
                }
            }

            Role::updateOrCreate(
                ['slug' => $slug, 'organization_id' => $organizationId],
                ['name' => ucfirst(str_replace('_', ' ', $slug)), 'description' => "Default {$slug} role", 'permissions' => $permissionsData, 'organization_id' => $organizationId]
            );
        }
    }
}
