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

export interface QuotationStats {
  totalQuotations: string | number;
  totalValue: string;
  draftCount: string | number;
  sentCount: string | number;
  acceptedCount: string | number;
  rejectedCount: string | number;
}

interface QuotationStatsCardsProps {
  stats: QuotationStats;
}

const QuotationStatsCards: React.FC<QuotationStatsCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <StatCard title="Total Quotations" value={stats.totalQuotations} subtext="all time" />
    <StatCard title="Total Value" value={stats.totalValue} subtext="sum of prices" />
    <StatCard title="Draft" value={stats.draftCount} subtext="not sent" />
    <StatCard title="Sent" value={stats.sentCount} subtext="awaiting response" />
    <StatCard title="Accepted" value={stats.acceptedCount} subtext="converted" />
    <StatCard title="Rejected" value={stats.rejectedCount} subtext="declined" />
  </div>
);

export default QuotationStatsCards;
