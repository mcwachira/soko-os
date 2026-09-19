<?php

namespace App\Services\Procurement;

use App\Models\ApprovalRule;
use App\Models\ApprovalStep;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ApprovalEngine
{
    public static function findApprovalRule(string $entityType, ?int $amountMinor, array $context = []): ?ApprovalRule
    {
        $query = ApprovalRule::where('organization_id', $context['organization_id'])
            ->where('entity_type', $entityType)
            ->where('is_active', true);

        if ($amountMinor !== null) {
            $query->where(function ($q) use ($amountMinor) {
                $q->whereNull('min_amount_minor')->orWhere('min_amount_minor', '<=', $amountMinor);
            })->where(function ($q) use ($amountMinor) {
                $q->whereNull('max_amount_minor')->orWhere('max_amount_minor', '>=', $amountMinor);
            });
        }

        if (!empty($context['department'])) {
            $query->where(function ($q) use ($context) {
                $q->where('department', $context['department'])->orWhereNull('department');
            });
        }

        if (!empty($context['supplier_id'])) {
            $query->where(function ($q) use ($context) {
                $q->where('supplier_id', $context['supplier_id'])->orWhereNull('supplier_id');
            });
        }

        if (!empty($context['branch_id'])) {
            $query->where(function ($q) use ($context) {
                $q->where('branch_id', $context['branch_id'])->orWhereNull('branch_id');
            });
        }

        if (!empty($context['currency'])) {
            $query->where('currency', $context['currency']);
        }

        if (!empty($context['purchase_type'])) {
            $query->where('purchase_type', $context['purchase_type']);
        }

        if (!empty($context['risk'])) {
            $query->where('risk', $context['risk']);
        }

        return $query->orderByDesc('min_amount_minor')->first();
    }

    public static function createApprovalChain(ApprovalRule $rule, string $entityType, string $entityId, ?User $requestedBy = null): array
    {
        $organizationId = $rule->organization_id;

        return DB::transaction(function () use ($rule, $organizationId) {
            $steps = [];
            foreach ($rule->steps()->orderBy('sequence')->get() as $templateStep) {
                $steps[] = ApprovalStep::create([
                    'organization_id' => $organizationId,
                    'approval_rule_id' => $rule->id,
                    'sequence' => $templateStep->sequence,
                    'approver_user_id' => $templateStep->approver_user_id,
                    'approver_role' => $templateStep->approver_role,
                    'mode' => $templateStep->mode,
                    'escalation_user_id' => $templateStep->escalation_user_id,
                    'expiry_minutes' => $templateStep->expiry_minutes,
                ]);
            }

            return $steps;
        });
    }

    public static function approveStep(ApprovalStep $step, User $user, ?string $comments = null): ApprovalStep
    {
        return DB::transaction(function () use ($step, $user, $comments) {
            if ($step->approver_user_id !== $user->id) {
                throw new InvalidArgumentException('User is not authorized to approve this step.');
            }

            $step->update([
                'status' => 'approved',
                'comments' => $comments,
                'acted_at' => now(),
            ]);

            return $step->fresh();
        });
    }

    public static function rejectStep(ApprovalStep $step, User $user, string $reason): ApprovalStep
    {
        return DB::transaction(function () use ($step, $user, $reason) {
            if ($step->approver_user_id !== $user->id) {
                throw new InvalidArgumentException('User is not authorized to reject this step.');
            }

            $step->update([
                'status' => 'rejected',
                'comments' => $reason,
                'acted_at' => now(),
            ]);

            return $step->fresh();
        });
    }

    public static function escalateStep(ApprovalStep $step): ApprovalStep
    {
        return DB::transaction(function () use ($step) {
            $nextStep = ApprovalStep::where('approval_rule_id', $step->approval_rule_id)
                ->where('sequence', '>', $step->sequence)
                ->orderBy('sequence')
                ->first();

            if (!$nextStep) {
                throw new InvalidArgumentException('No escalation approver available for this step.');
            }

            $step->update([
                'status' => 'escalated',
                'acted_at' => now(),
            ]);

            return $nextStep->fresh();
        });
    }

    public static function isFullyApproved(string $entityType, string $entityId, ?string $organizationId = null): bool
    {
        $rule = static::findApprovalRule($entityType, null, ['organization_id' => $organizationId]);
        if (!$rule) {
            return true;
        }

        $pendingSteps = ApprovalStep::where('approval_rule_id', $rule->id)
            ->whereNotIn('status', ['approved', 'escalated'])
            ->count();

        return $pendingSteps === 0;
    }

    public static function getCurrentStep(string $entityType, string $entityId, ?string $organizationId = null): ?ApprovalStep
    {
        $rule = static::findApprovalRule($entityType, null, ['organization_id' => $organizationId]);
        if (!$rule) {
            return null;
        }

        return ApprovalStep::where('approval_rule_id', $rule->id)
            ->whereNotIn('status', ['approved', 'rejected', 'escalated'])
            ->orderBy('sequence')
            ->first();
    }
}
