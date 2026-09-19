<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeArticle;
use App\Http\Requests\StoreKnowledgeArticleRequest;
use App\Http\Requests\UpdateKnowledgeArticleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KnowledgeArticleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', KnowledgeArticle::class);

        $query = KnowledgeArticle::where('organization_id', $request->user()->organization_id)
            ->with(['author']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('content', 'ilike', "%{$search}%");
            });
        }

        $articles = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 25));

        return response()->json($articles);
    }

    public function show(string $id)
    {
        $article = KnowledgeArticle::where('organization_id', request()->user()->organization_id)
            ->with(['author'])
            ->findOrFail($id);

        $this->authorize('view', $article);

        return response()->json(['data' => $article]);
    }

    public function store(StoreKnowledgeArticleRequest $request)
    {
        $this->authorize('create', KnowledgeArticle::class);

        $user = $request->user();
        $validated = $request->validated();

        $article = KnowledgeArticle::create([
            'id' => Str::uuid()->toString(),
            'organization_id' => $user->organization_id,
            'title' => $validated['title'],
            'slug' => $validated['slug'] ?? Str::slug($validated['title']),
            'content' => $validated['content'] ?? null,
            'category' => $validated['category'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'author_user_id' => $user->id,
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return response()->json(['data' => $article->load('author')], 201);
    }

    public function update(UpdateKnowledgeArticleRequest $request, string $id)
    {
        $article = KnowledgeArticle::where('organization_id', $request->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('update', $article);

        $validated = $request->validated();

        if (isset($validated['status']) && $validated['status'] === 'published' && !$article->published_at) {
            $validated['published_at'] = now();
        }

        $article->update($validated);

        return response()->json(['data' => $article->load('author')]);
    }

    public function destroy(string $id)
    {
        $article = KnowledgeArticle::where('organization_id', request()->user()->organization_id)
            ->findOrFail($id);

        $this->authorize('delete', $article);

        $article->delete();

        return response()->json(['message' => 'Knowledge article deleted']);
    }
}
