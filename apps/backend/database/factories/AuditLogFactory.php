<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'user_id' => User::factory(),
            'action' => fake()->randomElement(['created', 'updated', 'deleted', 'viewed', 'exported', 'approved', 'rejected']),
            'entity_type' => fake()->randomElement(['sale', 'product', 'customer', 'return', 'refund', 'shift', 'payment']),
            'entity_id' => Str::uuid()->toString(),
            'old_values' => fake()->optional()->randomElement([null, ['field' => 'old_value']]),
            'new_values' => fake()->optional()->randomElement([null, ['field' => 'new_value']]),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}