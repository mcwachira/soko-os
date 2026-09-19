'use client';

import AppLayout from '@/app/app/layout';
import { useJournalEntries } from '@/hooks/useTanStackQuery';
import { usePostJournalEntry, useReverseJournalEntry } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Eye, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import type { JournalEntry } from '@soko/domain-types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  posted: 'default',
  void: 'destructive',
};

export default function JournalsPage() {
  const { data, isLoading, isError, error } = useJournalEntries();
  const postMutation = usePostJournalEntry();
  const reverseMutation = useReverseJournalEntry();
  const entries = (data?.data ?? []) as (JournalEntry & { status?: string })[];
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);
  const [entryToReverse, setEntryToReverse] = useState<string | null>(null);

  const handleReverse = async () => {
    if (entryToReverse) {
      await reverseMutation.mutateAsync(entryToReverse);
      setReverseDialogOpen(false);
      setEntryToReverse(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground font-bold">View and manage journal entries</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load journal entries</p>
                <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && entries.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No journal entries yet</p>
                <p className="text-sm text-muted-foreground">Journal entries will appear here after transactions</p>
              </div>
            )}

            {!isLoading && !isError && entries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="p-2 text-left font-bold">Date</th>
                      <th className="p-2 text-left font-bold">Reference</th>
                      <th className="p-2 text-left font-bold">Reference ID</th>
                      <th className="p-2 text-left font-bold">Notes</th>
                      <th className="p-2 text-left font-bold">Status</th>
                      <th className="p-2 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-black hover:bg-muted/50">
                        <td className="p-2">{new Date(entry.entry_date).toLocaleDateString()}</td>
                        <td className="p-2 capitalize">{entry.reference_type}</td>
                        <td className="p-2 font-mono text-xs">{entry.reference_id}</td>
                        <td className="p-2 text-sm text-muted-foreground">{entry.notes || '-'}</td>
                        <td className="p-2">
                          <Badge variant={statusColors[entry.status || 'draft'] || 'secondary'} className="border-2 border-black capitalize">
                            {entry.status || 'draft'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" asChild className="border-2 border-black">
                              <Link href={`/journals/${entry.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {entry.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => postMutation.mutate(entry.id)}
                                className="border-2 border-black"
                                title="Post entry"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            {entry.status === 'posted' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => { setEntryToReverse(entry.id); setReverseDialogOpen(true); }}
                                className="border-2 border-black"
                                title="Reverse entry"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={reverseDialogOpen} onOpenChange={setReverseDialogOpen}>
          <AlertDialogContent className="border-2 border-black">
            <AlertDialogHeader>
              <AlertDialogTitle>Reverse Journal Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reverse this journal entry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel className="border-2 border-black">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReverse} className="border-2 border-black shadow">
                Reverse
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
