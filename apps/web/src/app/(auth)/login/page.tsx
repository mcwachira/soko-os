'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/useTanStackQuery';
import { LoginSchema } from '@soko/validation';
import { Loader2 } from 'lucide-react';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      device_uuid: undefined,
    },
  });

  useEffect(() => {
    if (loginMutation.isSuccess) {
      window.location.href = redirect;
    }
  }, [loginMutation.isSuccess, redirect]);

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-black shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Soko-OS</CardTitle>
          <p className="text-sm font-bold text-muted-foreground">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="border-2 border-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="border-2 border-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginMutation.isError && (
                <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-3">
                  <p className="text-sm font-bold text-destructive">
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : 'Login failed. Please check your credentials.'}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full border-2 border-black shadow"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
