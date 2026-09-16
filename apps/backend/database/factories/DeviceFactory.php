<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Terminal;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DeviceFactory extends Factory
{
    protected $model = Device::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'branch_id' => Branch::factory(),
            'terminal_id' => Terminal::factory(),
            'device_uuid' => Str::uuid()->toString(),
            'device_name' => fake()->word() . ' POS',
            'status' => fake()->randomElement(['pending', 'approved', 'disabled', 'revoked']),
            'last_seen_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'last_sync_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'app_version' => '1.0.' . fake()->randomNumber(2),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }
}