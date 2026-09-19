'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Gavel,
  FileText,
  Receipt,
  GitCompare,
  Wallet,
  CreditCard,
  RotateCcw,
  FileSignature,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Package,
} from 'lucide-react';
import { usePurchaseRequisitions } from '@/hooks/useTanStackQuery';
import { useRfqs } from '@/hooks/useTanStackQuery';
import { useSupplierInvoices } from '@/hooks/useTanStackQuery';
import { useThreeWayMatches } from '@/hooks/useTanStackQuery';
import { useSupplierPayments } from '@/hooks/useTanStackQuery';
import { fromMinorUnits } from '@soko/utils';
import { PurchaseRequisition, Rfq, SupplierInvoice, ThreeWayMatch, SupplierPayment } from '@soko/domain-types';

const modules = [
  { title: 'Requisitions', description: 'Purchase requisitions and approvals', href: '/procurement/requisitions', icon: ClipboardList, color: 'bg-main/10 text-main' },
  { title: 'RFQs', description: 'Request for quotations', href: '/procurement/rfqs', icon: Gavel, color: 'bg-main/10 text-main' },
  { title: 'Tenders', description: 'Tender management and bidding', href: '/procurement/tenders', icon: FileText, color: 'bg-main/10 text-main' },
  { title: 'Invoices', description: 'Supplier invoices and verification', href: '/procurement/invoices', icon: Receipt, color: 'bg-main/10 text-main' },
  { title: 'Three-Way Matches', description: 'PO, GRN, and invoice matching', href: '/procurement/matches', icon: GitCompare, color: 'bg-main/10 text-main' },
  { title: 'Payment Vouchers', description: 'Payment voucher processing', href: '/procurement/payment-vouchers', icon: Wallet, color: 'bg-main/10 text-main' },
  { title: 'Payments', description: 'Supplier payment execution', href: '/procurement/payments', icon: CreditCard, color: 'bg-main/10 text-main' },
  { title: 'Reconciliations', description: 'Payment reconciliation', href: '/procurement/reconciliations', icon: RotateCcw, color: 'bg-main/10 text-main' },
  { title: 'Contracts', description: 'Procurement contracts management', href: '/procurement/contracts', icon: FileSignature, color: 'bg-main/10 text-main' },
  { title: 'Approval Rules', description: 'Approval workflows and rules', href: '/procurement/approval-rules', icon: ShieldCheck, color: 'bg-main/10 text-main' },
];

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down';
};

function MetricCard({ title, value, change, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <Card className="border-2 border-black">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-base ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-black">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
            <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProcurementDashboardPage() {
  const { data: requisitionsData } = usePurchaseRequisitions();
  const { data: rfqsData } = useRfqs();
  const { data: invoicesData } = useSupplierInvoices();
  const { data: matchesData } = useThreeWayMatches();
  const { data: paymentsData } = useSupplierPayments();

  const requisitions = (requisitionsData?.data ?? []) as PurchaseRequisition[];
  const rfqs = (rfqsData?.data ?? []) as Rfq[];
  const invoices = (invoicesData?.data ?? []) as SupplierInvoice[];
  const matches = (matchesData?.data ?? []) as ThreeWayMatch[];
  const payments = (paymentsData?.data ?? []) as SupplierPayment[];

  // Calculate metrics
  const totalRequisitions = requisitions.length;
  const pendingRequisitions = requisitions.filter(r => r.status === 'submitted' || r.status === 'under_review').length;
  const approvedRequisitions = requisitions.filter(r => r.status === 'approved').length;
  const rejectedRequisitions = requisitions.filter(r => r.status === 'rejected').length;

  const totalRfqs = rfqs.length;
  const activeRfqs = rfqs.filter(r => r.status === 'sent' || r.status === 'partially_responded' || r.status === 'responses_received').length;
  const evaluationRfqs = rfqs.filter(r => r.status === 'evaluation').length;
  const awardedRfqs = rfqs.filter(r => r.status === 'awarded').length;

  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(i => i.status === 'submitted' || i.status === 'pending_verification').length;
  const verifiedInvoices = invoices.filter(i => i.status === 'verified').length;
  const mismatchedInvoices = invoices.filter(i => i.status === 'mismatched').length;

  const totalMatches = matches.length;
  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const mismatchedCount = matches.filter(m => m.status.includes('mismatch') || m.status === 'manual_review' || m.status === 'blocked').length;

  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  const totalSpend = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount_minor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Procurement</h1>
        <p className="text-muted-foreground font-bold">
          End-to-end procurement from requisition to payment
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <MetricCard
          title="Total Spend (YTD)"
          value={formatCurrency(totalSpend)}
          icon={DollarSign}
          color="bg-main/10 text-main"
          change="+12%"
          trend="up"
        />
        <MetricCard
          title="Pending Approvals"
          value={(pendingRequisitions + activeRfqs + evaluationRfqs).toString()}
          icon={AlertTriangle}
          color="bg-warning/10 text-warning"
          change="+5"
          trend="up"
        />
        <MetricCard
          title="Pending Receipts"
          value={pendingInvoices.toString()}
          icon={Package}
          color="bg-info/10 text-info"
          change="-3"
          trend="down"
        />
        <MetricCard
          title="Overdue Payments"
          value={failedPayments.toString()}
          icon={Clock}
          color="bg-destructive/10 text-destructive"
          change="+2"
          trend="up"
        />
        <MetricCard
          title="Active Requisitions"
          value={totalRequisitions.toString()}
          icon={ClipboardList}
          color="bg-main/10 text-main"
          change="+8%"
          trend="up"
        />
        <MetricCard
          title="Active RFQs"
          value={activeRfqs.toString()}
          icon={Gavel}
          color="bg-main/10 text-main"
          change="+3"
          trend="up"
        />
        <MetricCard
          title="Mismatched Invoices"
          value={mismatchedInvoices.toString()}
          icon={AlertTriangle}
          color="bg-destructive/10 text-destructive"
          change="+1"
          trend="up"
        />
        <MetricCard
          title="Matched Rate"
          value={totalMatches > 0 ? `${Math.round((matchedCount / totalMatches) * 100)}%` : '0%'}
          icon={GitCompare}
          color="bg-success/10 text-success"
          change="+2%"
          trend="up"
        />
      </div>

      {/* Quick Stats by Category */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">Requisitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{totalRequisitions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending Approval</span>
              <span className="font-bold text-warning">{pendingRequisitions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Approved</span>
              <span className="font-bold text-success">{approvedRequisitions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rejected</span>
              <span className="font-bold text-destructive">{rejectedRequisitions}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">RFQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{totalRfqs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active</span>
              <span className="font-bold text-info">{activeRfqs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">In Evaluation</span>
              <span className="font-bold text-warning">{evaluationRfqs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Awarded</span>
              <span className="font-bold text-success">{awardedRfqs}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{totalInvoices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending Verification</span>
              <span className="font-bold text-warning">{pendingInvoices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Verified</span>
              <span className="font-bold text-success">{verifiedInvoices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mismatched</span>
              <span className="font-bold text-destructive">{mismatchedInvoices}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-lg font-black">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{totalPayments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-bold text-success">{completedPayments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-bold text-warning">{pendingPayments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed</span>
              <span className="font-bold text-destructive">{failedPayments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation */}
      <div>
        <h2 className="text-2xl font-black mb-4">Procurement Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className={`border-2 border-black h-full transition-shadow hover:shadow-[4px_4px_0px_0px_rgb(0,0,0)] ${module.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <module.icon className="h-6 w-6" />
                    <CardTitle>{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}