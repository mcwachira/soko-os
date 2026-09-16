import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  label?: string;
}

export function LoadingState({ className, label = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
