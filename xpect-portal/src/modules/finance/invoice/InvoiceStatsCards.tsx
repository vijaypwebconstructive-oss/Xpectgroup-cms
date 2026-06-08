import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  onClick?: () => void;
  active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  onClick,
  active,
}) => (
  <div
    onClick={onClick}
    className={`
      rounded-xl border shadow-sm
      sm:p-5 p-3
      flex flex-col items-start gap-3
      cursor-pointer
      transition-all duration-200
bg-white border-[#e7ebf3]
    `}
  >
    <p className={`text-xs font-semibold uppercase tracking-wider text-black`}>
      {title}
    </p>

    <p
      className={`sm:text-2xl text-xl font-bold 
         "text-[#0d121b]"
      `}
    >
      {value}
    </p>

    {subtext && <p className={`text-xs  "text-white/70"`}>{subtext}</p>}
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

  activeFilter?: "ALL" | "PAID" | "OVERDUE" | "PENDING";

  onTotalClick?: () => void;
  onPaidClick?: () => void;
  onOverdueClick?: () => void;
  onPendingClick?: () => void;
}

const InvoiceStatsCards: React.FC<InvoiceStatsCardsProps> = ({
  stats,
  activeFilter,

  onTotalClick,
  onPaidClick,
  onOverdueClick,
  onPendingClick,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard
      title="Total Invoices"
      value={stats.totalInvoices}
      subtext="all time"
      onClick={onTotalClick}
      active={activeFilter === "ALL"}
    />

    <StatCard
      title="Paid Amount"
      value={stats.paidAmount}
      subtext="total paid"
      onClick={onPaidClick}
      active={activeFilter === "PAID"}
    />

    <StatCard
      title="Overdue Invoices"
      value={stats.overdueCount}
      subtext="past due"
      onClick={onOverdueClick}
      active={activeFilter === "OVERDUE"}
    />

    <StatCard
      title="Pending"
      value={stats.pendingCount}
      subtext="awaiting payment"
      onClick={onPendingClick}
      active={activeFilter === "PENDING"}
    />
  </div>
);

export default InvoiceStatsCards;
