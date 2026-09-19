'use client';

import AppLayout from '@/app/app/layout';
import { useEtimsSubmissions, useRetryEtimsSubmission } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function EtimsPage() {
  const { data, isLoading, isError } = useEtimsSubmissions();
  const retryMutation = useRetryEtimsSubmission();
  const submissions = data?.data ?? [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'failed': return 'destructive';
      case 'blocked_external': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">eTIMS Stock</h1>
          <p className="text-muted-foreground font-bold">KRA eTIMS fiscalization queue and status</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Stock Fiscalization Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full border-2 border-black" />
                ))}
              </div>
            )}

            {isError && (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-destructive">Failed to load eTIMS submissions</p>
              </div>
            )}

            {!isLoading && !isError && submissions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No submissions</p>
                <p className="text-sm text-muted-foreground">Stock movements are fiscalized automatically</p>
              </div>
            )}

            {!isLoading && !isError && submissions.length > 0 && (
              <div className="space-y-2">
                {submissions.map((sub: { id: string; event_type: string; submission_status: string; attempt_count: number; error_message?: string }) => (
                  <div key={sub.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{sub.event_type}</div>
                      <div className="text-xs text-muted-foreground">
                        Attempts: {sub.attempt_count} · {sub.error_message || 'No errors'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.submission_status === 'failed' || sub.submission_status === 'rejected' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryMutation.mutate(sub.id)}
                          className="border-2 border-black"
                        >
                          Retry
                        </Button>
                      ) : null}
                      <Badge variant={getStatusVariant(sub.submission_status)} className="border-2 border-black">
                        {sub.submission_status}
                      </Badge>
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
