<?php

namespace Database\Factories;

use App\Models\TaxSubmission;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TaxSubmissionFactory extends Factory
{
    protected $model = TaxSubmission::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'organization_id' => Organization::factory(),
            'business_id' => Business::factory(),
            'sale_id' => Sale::factory(),
            'country_code' => 'KE',
            'tax_authority' => 'KRA',
            'status' => fake()->randomElement(['pending', 'queued', 'submitting', 'accepted', 'rejected', 'failed']),
            'control_code' => fake()->optional()->bothify('CTRL-########'),
            'qr_code_url' => fake()->optional()->url(),
            'fiscal_signature' => fake()->optional()->sha256(),
            'request_payload' => [],
            'response_payload' => fake()->optional()->randomElement([[], ['code' => '000', 'message' => 'Success']]),
            'error_message' => fake()->optional()->sentence(),
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'control_code' => 'CTRL-' . fake()->unique()->numerify('########'),
            'qr_code_url' => fake()->url(),
            'fiscal_signature' => fake()->sha256(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}