'use client';

import AppLayout from '@/app/app/layout';
import { usePackages } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PackagesPage() {
  const { data, isLoading, isError } = usePackages();
  const packages = data?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Packages</h1>
          <p className="text-muted-foreground font-bold">Package tracking and management</p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Packages</CardTitle>
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
                <p className="text-sm font-bold text-destructive">Failed to load packages</p>
              </div>
            )}

            {!isLoading && !isError && packages.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-lg font-bold">No packages found</p>
                <p className="text-sm text-muted-foreground">Packages are created during order fulfillment</p>
              </div>
            )}

            {!isLoading && !isError && packages.length > 0 && (
              <div className="space-y-2">
                {packages.map((pkg: { id: string; package_number: string; status: string; weight?: number }) => (
                  <div key={pkg.id} className="flex items-center justify-between border-b border-black p-2">
                    <div>
                      <div className="text-sm font-bold">{pkg.package_number}</div>
                      <div className="text-xs text-muted-foreground">{pkg.weight ? `Weight: ${pkg.weight}kg` : 'No weight'}</div>
                    </div>
                    <Badge variant={pkg.status === 'delivered' ? 'default' : 'secondary'} className="border-2 border-black">
                      {pkg.status}
                    </Badge>
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
