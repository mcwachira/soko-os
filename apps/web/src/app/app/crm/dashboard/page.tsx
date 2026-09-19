'use client';

import AppLayout from '@/app/app/layout';
import { useLeads } from '@/hooks/useTanStackQuery';
import { useCrmAccounts } from '@/hooks/useTanStackQuery';
import { useContacts } from '@/hooks/useTanStackQuery';
import { useDeals } from '@/hooks/useTanStackQuery';
import { useActivities } from '@/hooks/useTanStackQuery';
import { usePipelines } from '@/hooks/useTanStackQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Target, DollarSign, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { Pipeline, Deal, Activity } from '@soko/domain-types';

export default function CrmDashboardPage() {
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: accountsData, isLoading: accountsLoading } = useCrmAccounts();
  const { data: contactsData, isLoading: contactsLoading } = useContacts();
  const { data: dealsData, isLoading: dealsLoading } = useDeals();
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities();
  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelines();

  const leads = (leadsData?.data ?? []) as Array<{ status: string; score: number }>;
  const accounts = (accountsData?.data ?? []) as Array<{ account_type: string }>;
  const contacts = (contactsData?.data ?? []) as Array<{ is_decision_maker: boolean }>;
  const deals = (dealsData?.data ?? []) as Deal[];
  const activities = (activitiesData?.data ?? []) as Activity[];
  const pipelines = (pipelinesData?.data ?? []) as Pipeline[];

  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const totalDealValue = deals.reduce((sum, d) => sum + (d.value_minor || 0), 0);
  const wonDeals = deals.filter(d => d.status === 'won').length;
  const openDeals = deals.filter(d => d.status !== 'won' && d.status !== 'lost').length;
  const overdueActivities = activities.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed').length;
  const highPriorityActivities = activities.filter(a => a.priority === 'high' && a.status !== 'completed').length;

  const isLoading = leadsLoading || accountsLoading || contactsLoading || dealsLoading || activitiesLoading || pipelinesLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">CRM Dashboard</h1>
          <p className="text-muted-foreground font-bold">Overview of your sales pipeline and activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-2 border-border">
                <CardHeader>
                  <Skeleton className="h-4 w-24 border-2 border-border" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 border-2 border-border" />
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { title: 'New Leads', value: newLeads.toString(), icon: UserPlus, color: 'text-main' },
              { title: 'Qualified Leads', value: qualifiedLeads.toString(), icon: TrendingUp, color: 'text-success' },
              { title: 'Total Accounts', value: accounts.length.toString(), icon: Users, color: 'text-main' },
              { title: 'Total Contacts', value: contacts.length.toString(), icon: Target, color: 'text-info' },
              { title: 'Open Deals', value: openDeals.toString(), icon: Target, color: 'text-warning' },
              { title: 'Won Deals', value: wonDeals.toString(), icon: TrendingUp, color: 'text-success' },
              { title: 'Pipeline Value', value: formatCurrency(totalDealValue), icon: DollarSign, color: 'text-main' },
              { title: 'Overdue Activities', value: overdueActivities.toString(), icon: Calendar, color: 'text-destructive' },
            ].map((stat) => (
              <Card key={stat.title} className="border-2 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Pipeline Health</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full border-2 border-border" />
              ) : (
                <div className="space-y-2">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="flex items-center justify-between p-3 rounded-lg border-2 border-border">
                      <span className="font-bold">{pipeline.name}</span>
                      <span className={`text-sm font-bold ${pipeline.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                        {pipeline.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                  {pipelines.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No pipelines configured</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full border-2 border-border" />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">High Priority</span>
                    <span className="font-black text-warning">{highPriorityActivities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Overdue</span>
                    <span className="font-black text-destructive">{overdueActivities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Total Activities</span>
                    <span className="font-black">{activities.length}</span>
                  </div>
                  {activities.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No activities scheduled</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-2 border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-black">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full border-2 border-border" />
              ) : deals.length > 0 ? (
                <div className="space-y-2">
                  {deals.slice(0, 5).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between rounded-lg border-2 border-border p-4">
                      <div>
                        <p className="font-bold">{deal.deal_name}</p>
                        <p className="text-sm text-muted-foreground">{deal.currency} {(deal.value_minor / 100).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold capitalize">{deal.status.replace('_', ' ')}</p>
                        {deal.expected_close_date && (
                          <p className="text-sm text-muted-foreground">Close: {deal.expected_close_date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No deals yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-black">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/crm/leads" className="flex items-center gap-2 p-3 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors">
                  <UserPlus className="h-5 w-5 text-main" />
                  <span className="font-bold">Add Lead</span>
                </Link>
                <Link href="/crm/accounts" className="flex items-center gap-2 p-3 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors">
                  <Users className="h-5 w-5 text-main" />
                  <span className="font-bold">Add Account</span>
                </Link>
                <Link href="/crm/deals" className="flex items-center gap-2 p-3 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors">
                  <Target className="h-5 w-5 text-main" />
                  <span className="font-bold">Create Deal</span>
                </Link>
                <Link href="/crm/activities" className="flex items-center gap-2 p-3 rounded-lg border-2 border-border hover:bg-muted/50 transition-colors">
                  <Calendar className="h-5 w-5 text-main" />
                  <span className="font-bold">Schedule Activity</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}