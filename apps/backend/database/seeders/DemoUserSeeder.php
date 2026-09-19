<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::first();

        if (! $organization) {
            $organization = Organization::create([
                'id' => Str::uuid()->toString(),
                'name' => 'Demo Organization',
                'slug' => 'demo',
                'tax_number' => 'N/A',
                'country_code' => 'KE',
                'currency' => 'KES',
            ]);
        }

        $demoUsers = [
            [
                'email' => 'owner@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Owner',
                'role' => 'owner',
                'permissions' => ['*'],
            ],
            [
                'email' => 'admin@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Admin',
                'role' => 'admin',
                'permissions' => ['*'],
            ],
            [
                'email' => 'manager@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Manager',
                'role' => 'manager',
                'permissions' => ['*'],
            ],
            [
                'email' => 'accountant@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Accountant',
                'role' => 'accountant',
                'permissions' => ['*'],
            ],
            [
                'email' => 'cashier@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Cashier',
                'role' => 'cashier',
                'permissions' => ['*'],
            ],
            [
                'email' => 'auditor@soko.local',
                'password' => Hash::make('password'),
                'name' => 'Demo Auditor',
                'role' => 'auditor',
                'permissions' => ['*'],
            ],
        ];

        foreach ($demoUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email'], 'organization_id' => $organization->id],
                [
                    'id' => Str::uuid()->toString(),
                    'organization_id' => $organization->id,
                    'business_id' => null,
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'role' => $userData['role'],
                    'permissions' => $userData['permissions'],
                    'is_active' => true,
                ]
            );
        }
    }
}
