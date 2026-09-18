'use client';

import AppLayout from '@/app/app/layout';
import { useKnowledgeArticles, useCreateKnowledgeArticle } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateKnowledgeArticleSchema } from '@soko/validation';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';

type KnowledgeArticleItem = {
  id: string;
  title: string;
  category?: string | null;
  status: string;
  published_at?: string | null;
  created_at: string;
};

export default function KnowledgeArticlesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useKnowledgeArticles();
  const createMutation = useCreateKnowledgeArticle();
  const articles = (data?.data ?? []) as KnowledgeArticleItem[];

  const form = useForm({
    resolver: zodResolver(CreateKnowledgeArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      status: 'draft',
      author_user_id: '',
    },
  });

  const onCreate = form.handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
        refetch();
      },
    });
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground font-bold">Manage help articles and documentation</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="border-2 border-black shadow">
                <Plus className="mr-2 h-4 w-4" />
                Add Article
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Add Article</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Title</Label>
                  <Input {...form.register('title')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Category</Label>
                  <Input {...form.register('category')} className="border-2 border-black" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Content</Label>
                  <Textarea {...form.register('content')} className="border-2 border-black" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full border-2 border-black shadow">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Article
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center text-destructive">
                <p>Failed to load articles</p>
              </div>
            ) : articles.length === 0 ? (
              <EmptyState title="No articles yet" description="Add your first article to build your knowledge base." />
            ) : (
              <div className="space-y-2">
                {articles
                  .filter((article) => {
                    if (!searchQuery) return true;
                    return article.title.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between rounded-lg border-2 border-black p-4"
                    >
                      <div>
                        <p className="font-bold">{article.title}</p>
                        <p className="text-sm text-muted-foreground">{article.category || 'Uncategorised'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{article.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
