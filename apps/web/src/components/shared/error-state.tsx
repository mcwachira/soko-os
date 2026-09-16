'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  className?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  className,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8 text-center', className)}>
      <div className="text-4xl font-black text-destructive">!</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="text-sm font-bold text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
