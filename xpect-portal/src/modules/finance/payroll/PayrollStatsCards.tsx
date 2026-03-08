import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-5 p-3 flex flex-col items-start gap-3">
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">{title}</p>
    <p className="sm:text-2xl text-xl font-bold text-[#0d121b]">{value}</p>
  </div>
);

interface PayrollStatsCardsProps {
  totalPayroll?: string | number;
  employees?: string | number;
  processed?: string | number;
  pending?: string | number;
}

const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  totalPayroll = '—',
  employees = '—',
  processed = '—',
  pending = '—',
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard title="Total Payroll" value={totalPayroll} />
    <StatCard title="Employees" value={employees} />
    <StatCard title="Processed" value={processed} />
    <StatCard title="Pending" value={pending} />
  </div>
);

export default PayrollStatsCards;
