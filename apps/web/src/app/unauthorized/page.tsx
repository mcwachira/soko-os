'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-black shadow">
        <CardHeader className="text-center">
          <Lock className="mx-auto h-12 w-12 mb-4" />
          <CardTitle className="text-2xl font-black">Access Denied</CardTitle>
          <p className="text-sm font-bold text-muted-foreground">
            You don&apos;t have permission to access this resource.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            If you believe this is an error, please contact your administrator.
          </p>
          <Button asChild className="border-2 border-black shadow">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
