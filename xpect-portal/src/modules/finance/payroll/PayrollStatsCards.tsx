import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, onClick }) => (
  <div
    onClick={onClick}
    className="
      bg-white rounded-xl border border-[#e7ebf3]
      shadow-sm sm:p-5 p-3
      flex flex-col items-start gap-3
      cursor-pointer
      hover:shadow-md
      hover:border-[#2E4150]
      transition-all duration-200
    "
  >
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">
      {title}
    </p>

    <p className="sm:text-2xl text-xl font-bold text-[#0d121b]">{value}</p>
  </div>
);

interface PayrollStatsCardsProps {
  totalPayroll?: string | number;
  employees?: string | number;
  processed?: string | number;
  pending?: string | number;

  onTotalClick?: () => void;
  onEmployeesClick?: () => void;
  onProcessedClick?: () => void;
  onPendingClick?: () => void;
}

const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  totalPayroll = "—",
  employees = "—",
  processed = "—",
  pending = "—",

  onTotalClick,
  onEmployeesClick,
  onProcessedClick,
  onPendingClick,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard
      title="Total Payroll"
      value={totalPayroll}
      onClick={onTotalClick}
    />

    <StatCard title="Employees" value={employees} onClick={onEmployeesClick} />

    <StatCard title="Processed" value={processed} onClick={onProcessedClick} />

    <StatCard title="Pending" value={pending} onClick={onPendingClick} />
  </div>
);

export default PayrollStatsCards;
