import AppLayout from '@/app/(app)/layout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-bold">
            Welcome to Soko-OS. Here's what's happening with your business.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Sales', value: 'KES 0', change: '+0%' },
            { title: 'Revenue', value: 'KES 0', change: '+0%' },
            { title: 'Customers', value: '0', change: '+0' },
            { title: 'Products', value: '0', change: '+0' },
          ].map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border-2 border-black bg-secondary-background p-6 shadow"
            >
              <div className="text-sm font-bold text-muted-foreground">{stat.title}</div>
              <div className="text-2xl font-black mt-2">{stat.value}</div>
              <div className="text-sm font-bold text-success mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
            <h3 className="text-lg font-black mb-4">Sales Performance</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground font-bold">
              Chart will appear here when data is available
            </div>
          </div>
          <div className="col-span-3 rounded-xl border-2 border-black bg-secondary-background p-6 shadow">
            <h3 className="text-lg font-black mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-sm font-bold text-muted-foreground">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
