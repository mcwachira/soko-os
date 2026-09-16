<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $org = Organization::firstOrCreate(
            ['slug' => 'soko-demo'],
            [
                'name' => 'Soko Demo Organization',
                'tax_number' => 'P051234567Z',
                'country_code' => 'KE',
                'currency' => 'KES',
            ]
        );

        $business = $org->businesses()->first();

        if (! $business) {
            $business = $org->businesses()->create([
                'name' => 'Soko Demo Business',
                'business_type' => 'retail',
                'tax_pin' => 'P051234567Z',
                'currency' => 'KES',
                'is_active' => true,
            ]);
        }

        $branch = $business->branches()->first();

        if (! $branch) {
            $branch = $business->branches()->create([
                'organization_id' => $org->id,
                'name' => 'Nairobi Central',
                'code' => 'NRB01',
                'address' => 'Kenyatta Avenue, Nairobi',
                'phone' => '+254700000000',
                'is_active' => true,
            ]);
        }

        $terminal = $business->terminals()->first();

        if (! $terminal) {
            $terminal = $business->terminals()->create([
                'organization_id' => $org->id,
                'branch_id' => $branch->id,
                'name' => 'Terminal 1',
                'terminal_code' => 'T01',
                'is_active' => true,
            ]);
        }

        if (! User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'organization_id' => $org->id,
                'business_id' => $business->id,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'permissions' => ['*'],
                'is_active' => true,
            ]);
        }

        $category = $business->categories()->first();
        if (! $category) {
            $category = Category::factory()->create([
                'organization_id' => $org->id,
                'business_id' => $business->id,
                'name' => 'General',
                'slug' => 'general',
            ]);
        }

        if ($business->products()->count() === 0) {
            Product::factory()->count(20)->create([
                'organization_id' => $org->id,
                'business_id' => $business->id,
                'category_id' => $category->id,
            ]);

            Customer::factory()->count(5)->create([
                'organization_id' => $org->id,
                'business_id' => $business->id,
            ]);
        }

        $this->call(RoleSeeder::class);
    }
}
