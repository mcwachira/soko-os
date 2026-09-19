<?php

namespace App\Policies;

use App\Models\KnowledgeArticle;
use App\Models\User;

class KnowledgeArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('crm.knowledge.view') || $user->role === 'admin' || $user->role === 'support_agent' || $user->role === 'support_manager';
    }

    public function view(User $user, KnowledgeArticle $article): bool
    {
        if ($article->status === 'published') {
            return true;
        }

        if ($user->hasPermission('crm.knowledge.view') || $user->role === 'admin') {
            return true;
        }

        return $user->organization_id === $article->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('crm.knowledge.create') || $user->role === 'admin' || $user->role === 'support_manager';
    }

    public function update(User $user, KnowledgeArticle $article): bool
    {
        if ($user->role === 'admin' || $user->role === 'support_manager') {
            return true;
        }

        return $user->hasPermission('crm.knowledge.update') && $user->organization_id === $article->organization_id;
    }

    public function delete(User $user, KnowledgeArticle $article): bool
    {
        return $user->hasPermission('crm.knowledge.delete') || $user->role === 'admin';
    }
}
