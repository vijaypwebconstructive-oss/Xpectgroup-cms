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
    <p
      className={`text-xs font-semibold uppercase tracking-wider text-black/70
      `}
    >
      {title}
    </p>

    <p className={`sm:text-2xl text-xl font-bold text-[#0d121b]`}>{value}</p>

    {subtext && <p className={`text-xs  text-black/70 `}>{subtext}</p>}
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

  activeFilter?: "ALL" | "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";

  onTotalClick?: () => void;
  onDraftClick?: () => void;
  onSentClick?: () => void;
  onAcceptedClick?: () => void;
  onRejectedClick?: () => void;
}

const QuotationStatsCards: React.FC<QuotationStatsCardsProps> = ({
  stats,
  activeFilter,

  onTotalClick,
  onDraftClick,
  onSentClick,
  onAcceptedClick,
  onRejectedClick,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <StatCard
      title="Total Quotations"
      value={stats.totalQuotations}
      subtext="all time"
      onClick={onTotalClick}
      active={activeFilter === "ALL"}
    />

    <StatCard
      title="Total Value"
      value={stats.totalValue}
      subtext="sum of prices"
      onClick={onTotalClick}
      active={activeFilter === "ALL"}
    />

    <StatCard
      title="Draft"
      value={stats.draftCount}
      subtext="not sent"
      onClick={onDraftClick}
      active={activeFilter === "DRAFT"}
    />

    <StatCard
      title="Sent"
      value={stats.sentCount}
      subtext="awaiting response"
      onClick={onSentClick}
      active={activeFilter === "SENT"}
    />

    <StatCard
      title="Accepted"
      value={stats.acceptedCount}
      subtext="converted"
      onClick={onAcceptedClick}
      active={activeFilter === "ACCEPTED"}
    />

    <StatCard
      title="Rejected"
      value={stats.rejectedCount}
      subtext="declined"
      onClick={onRejectedClick}
      active={activeFilter === "REJECTED"}
    />
  </div>
);

export default QuotationStatsCards;
