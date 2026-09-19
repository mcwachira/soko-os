import AppLayout from '@/app/app/layout';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          <p className="text-muted-foreground font-bold">
            Business intelligence and insights
          </p>
        </div>
        <div className="rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
          <p className="text-muted-foreground font-bold">Analytics module coming soon.</p>
        </div>
      </div>
    </AppLayout>
  );
}
