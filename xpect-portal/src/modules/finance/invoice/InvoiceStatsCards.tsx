import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-5 p-3 flex flex-col items-start gap-3">
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">{title}</p>
    <p className="sm:text-2xl text-xl font-bold text-[#0d121b]">{value}</p>
    {subtext && <p className="text-xs text-[#6b7a99]">{subtext}</p>}
  </div>
);

export interface InvoiceStats {
  totalInvoices: string | number;
  paidAmount: string;
  overdueCount: string | number;
  pendingCount: string | number;
}

interface InvoiceStatsCardsProps {
  stats: InvoiceStats;
}

const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard title="Total Invoices" value={stats.totalInvoices} subtext="all time" />
    <StatCard title="Paid Amount" value={stats.paidAmount} subtext="total paid" />
    <StatCard title="Overdue Invoices" value={stats.overdueCount} subtext="past due" />
    <StatCard title="Pending" value={stats.pendingCount} subtext="awaiting payment" />
  </div>
);

export default InvoiceStatsCards;
