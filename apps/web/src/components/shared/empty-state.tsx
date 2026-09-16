import { cn } from '@/lib/utils';

interface EmptyStateProps {
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  title = 'No data found',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-8 text-center', className)}>
      <div className="text-4xl font-black text-muted-foreground">∅</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="text-sm font-bold text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
