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

const ExpenseStatsCards: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard title="Total Expenses" value="£48,250.00" subtext="Current month" />
    <StatCard title="Payroll Expenses" value="£32,100.00" subtext="66% of total" />
    <StatCard title="Operational Expenses" value="£12,450.00" subtext="26% of total" />
    <StatCard title="Pending Reimbursements" value="£3,700.00" subtext="8 pending" />
  </div>
);

export default ExpenseStatsCards;
