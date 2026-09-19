<?php

namespace Tests\Feature\Procurement;

use App\Models\ApprovalRule;
use App\Models\ApprovalStep;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Procurement\ApprovalEngine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApprovalEngineTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdminOf(Organization $organization): User
    {
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'business_id' => Business::factory()->create(['organization_id' => $organization->id])->id,
            'role' => 'admin',
            'permissions' => ['*'],
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function seedTenantData(Organization $organization): array
    {
        $business = Business::factory()->create(['organization_id' => $organization->id]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);
        $warehouse = Warehouse::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id, 'branch_id' => $branch->id]);
        $supplier = Supplier::factory()->create(['organization_id' => $organization->id, 'business_id' => $business->id]);

        return [
            'organization' => $organization,
            'business' => $business,
            'branch' => $branch,
            'warehouse' => $warehouse,
            'supplier' => $supplier,
        ];
    }

    public function test_approval_rule_matching_by_amount(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 10000,
            'max_amount_minor' => 100000,
            'is_active' => true,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
        ]);

        $this->assertNotNull($matchedRule);
        $this->assertEquals($rule->id, $matchedRule->id);
    }

    public function test_approval_rule_matching_by_department(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 0,
            'max_amount_minor' => 1000000,
            'department' => 'IT',
            'is_active' => true,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
            'department' => 'IT',
        ]);

        $this->assertNotNull($matchedRule);
        $this->assertEquals($rule->id, $matchedRule->id);
    }

    public function test_approval_rule_matching_by_branch(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 0,
            'max_amount_minor' => 1000000,
            'branch_id' => $data['branch']->id,
            'is_active' => true,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
            'branch_id' => $data['branch']->id,
        ]);

        $this->assertNotNull($matchedRule);
        $this->assertEquals($rule->id, $matchedRule->id);
    }

    public function test_approval_rule_matching_by_supplier(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 0,
            'max_amount_minor' => 1000000,
            'supplier_id' => $data['supplier']->id,
            'is_active' => true,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
            'supplier_id' => $data['supplier']->id,
        ]);

        $this->assertNotNull($matchedRule);
        $this->assertEquals($rule->id, $matchedRule->id);
    }

    public function test_inactive_rule_is_not_matched(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 10000,
            'max_amount_minor' => 100000,
            'is_active' => false,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
        ]);

        $this->assertNull($matchedRule);
    }

    public function test_approval_rule_not_matched_for_amount_out_of_range(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 100000,
            'max_amount_minor' => 500000,
            'is_active' => true,
        ]);

        $matchedRule = ApprovalEngine::findApprovalRule('purchase_requisition', 50000, [
            'organization_id' => $organization->id,
        ]);

        $this->assertNull($matchedRule);
    }

    public function test_approval_chain_creation(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $approver1 = User::factory()->create(['organization_id' => $organization->id]);
        $approver2 = User::factory()->create(['organization_id' => $organization->id]);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
            'approver_user_id' => $approver1->id,
            'mode' => 'sequential',
        ]);

        ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 2,
            'approver_user_id' => $approver2->id,
            'mode' => 'sequential',
        ]);

        $steps = ApprovalEngine::createApprovalChain($rule, 'purchase_requisition', 'test-entity-id');

        $this->assertCount(2, $steps);
        $this->assertEquals($approver1->id, $steps[0]->approver_user_id);
        $this->assertEquals(1, $steps[0]->sequence);
        $this->assertEquals($approver2->id, $steps[1]->approver_user_id);
        $this->assertEquals(2, $steps[1]->sequence);
    }

    public function test_step_approval(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $approver = User::factory()->create(['organization_id' => $organization->id]);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        $step = ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
            'approver_user_id' => $approver->id,
        ]);

        $this->assertDatabaseHas('approval_steps', [
            'id' => $step->id,
            'approver_user_id' => $approver->id,
            'sequence' => 1,
        ]);
    }

    public function test_step_rejection(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $approver = User::factory()->create(['organization_id' => $organization->id]);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        $step = ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
            'approver_user_id' => $approver->id,
        ]);

        $this->assertDatabaseHas('approval_steps', [
            'id' => $step->id,
            'approver_user_id' => $approver->id,
        ]);
    }

    public function test_step_escalation(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $approver1 = User::factory()->create(['organization_id' => $organization->id]);
        $approver2 = User::factory()->create(['organization_id' => $organization->id]);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        $step1 = ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
            'approver_user_id' => $approver1->id,
        ]);

        ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 2,
            'approver_user_id' => $approver2->id,
        ]);

        $this->assertDatabaseHas('approval_steps', [
            'id' => $step1->id,
            'sequence' => 1,
        ]);
    }

    public function test_is_fully_approved_when_no_rule_matches(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $isFullyApproved = ApprovalEngine::isFullyApproved('purchase_requisition', 'test-entity-id', $organization->id);

        $this->assertTrue($isFullyApproved);
    }

    public function test_is_fully_approved_when_all_steps_approved(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
        ]);

        $this->assertDatabaseHas('approval_steps', [
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
        ]);
    }

    public function test_is_not_fully_approved_when_steps_pending(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
        ]);

        $this->assertDatabaseHas('approval_steps', [
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
        ]);
    }

    public function test_get_current_step_returns_first_pending(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $approver1 = User::factory()->create(['organization_id' => $organization->id]);
        $approver2 = User::factory()->create(['organization_id' => $organization->id]);

        $rule = ApprovalRule::create([
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'is_active' => true,
        ]);

        $step1 = ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 1,
            'approver_user_id' => $approver1->id,
        ]);

        $step2 = ApprovalStep::create([
            'organization_id' => $organization->id,
            'approval_rule_id' => $rule->id,
            'sequence' => 2,
            'approver_user_id' => $approver2->id,
        ]);

        $this->assertNotNull($step1);
        $this->assertEquals(1, $step1->sequence);
        $this->assertNotNull($step2);
        $this->assertEquals(2, $step2->sequence);
    }

    public function test_get_current_step_returns_null_when_no_rule(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);

        $currentStep = ApprovalEngine::getCurrentStep('purchase_requisition', 'test-entity-id', $organization->id);

        $this->assertNull($currentStep);
    }

    public function test_approval_rule_crud(): void
    {
        $organization = Organization::factory()->create();
        $this->actingAsAdminOf($organization);
        $data = $this->seedTenantData($organization);

        $payload = [
            'entity_type' => 'purchase_requisition',
            'min_amount_minor' => 10000,
            'max_amount_minor' => 100000,
            'department' => 'IT',
            'branch_id' => $data['branch']->id,
            'supplier_id' => $data['supplier']->id,
            'category' => 'office',
            'cost_center' => 'CC-001',
            'currency' => 'KES',
            'purchase_type' => 'standard',
            'risk' => 'low',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/procurement/approval-rules', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'entity_type', 'min_amount_minor', 'max_amount_minor']]);

        $ruleId = $response->json('data.id');

        $this->assertDatabaseHas('approval_rules', [
            'id' => $ruleId,
            'organization_id' => $organization->id,
            'entity_type' => 'purchase_requisition',
            'department' => 'IT',
        ]);

        $updatePayload = [
            'min_amount_minor' => 20000,
            'risk' => 'medium',
        ];

        $updateResponse = $this->putJson("/api/v1/procurement/approval-rules/{$ruleId}", $updatePayload);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.min_amount_minor', 20000);

        $listResponse = $this->getJson('/api/v1/procurement/approval-rules');

        $listResponse->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'entity_type']]]);

        $deleteResponse = $this->deleteJson("/api/v1/procurement/approval-rules/{$ruleId}");

        $deleteResponse->assertStatus(200)
            ->assertJson(['message' => 'Approval rule deleted']);

        $this->assertDatabaseMissing('approval_rules', ['id' => $ruleId]);
    }

    public function test_tenant_cannot_access_other_tenant_approval_rule(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $this->actingAsAdminOf($orgA);
        $this->seedTenantData($orgB);

        $ruleB = ApprovalRule::create([
            'organization_id' => $orgB->id,
            'entity_type' => 'purchase_requisition',
        ]);

        $this->actingAsAdminOf($orgA);

        $response = $this->getJson("/api/v1/procurement/approval-rules/{$ruleB->id}");

        $response->assertStatus(404);
    }
}
