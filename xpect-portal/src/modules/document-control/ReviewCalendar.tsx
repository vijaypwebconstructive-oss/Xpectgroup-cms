import React, { useMemo, useState } from "react";
import { usePolicyDocuments } from "../../context/PolicyDocumentsContext";
import { daysUntilDate } from "./mockData";
import { PolicyDocument } from "./types";

interface Props {
  onSelectDoc: (id: string) => void;
  onBack: () => void;
}

const formatDate = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface ReviewItem {
  doc: PolicyDocument;
  daysLeft: number;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  borderColor: string;
  trend: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, value, icon, iconBg, borderColor, trend, active, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:scale-[1.01] transition-all sm:p-5 p-4 flex flex-col items-start gap-4 border-b-[5px] text-left cursor-pointer ${
      active ? "" : ""
    }`}
    style={{
      borderBottomColor: active ? borderColor : "transparent",
    }}
  >
    <div className="flex items-start justify-between w-full">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>

      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
        {trend}
      </span>
    </div>

    <div>
      <p className="text-sm font-semibold text-[#4c669a]">{label}</p>

      <p className="text-3xl font-black text-[#0d121b] mt-1">{value}</p>
    </div>
  </button>
);

// ── Section component ─────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle: string;
  items: ReviewItem[];
  accent: string;
  iconColor: string;
  badgeCls: string;
  icon: string;
  onSelect: (id: string) => void;
  emptyText: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  items,
  accent,
  iconColor,
  badgeCls,
  icon,
  onSelect,
  emptyText,
}) => (
  <div
    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${accent}`}
  >
    {/* Section header */}
    <div className="sm:px-6 px-3 sm:py-4 py-3 border-b border-[#e7ebf3] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}
        >
          <span className="material-symbols-outlined text-[18px] p-2">
            {icon}
          </span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0d121b]">{title}</h2>
          <p className="text-xs text-[#6b7a99]">{subtitle}</p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeCls}`}
      >
        {items.length}
      </span>
    </div>

    {items.length === 0 ? (
      <div className="px-6 py-10 text-center">
        <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">
          check_circle
        </span>
        <p className="text-sm text-[#6b7a99]">{emptyText}</p>
      </div>
    ) : (
      <div className="divide-y divide-[#e7ebf3]">
        {items.map(({ doc, daysLeft }) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className="w-full flex sm:items-center items-start gap-4 sm:px-6 px-3 sm:py-4 py-3 text-left hover:bg-[#f6f7fb] transition-colors group"
          >
            {/* Category dot */}
            <div
              className="w-2 h-2 rounded-full bg-current shrink-0 mt-1"
              style={{ color: "inherit" }}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0d121b] truncate group-hover:text-[#2e4150]">
                {doc.title}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-[#6b7a99]">{doc.category}</span>
                <span className="text-xs text-[#6b7a99]">
                  Owner: {doc.owner}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0f2f7] text-[#2e4150] font-mono">
                  v{doc.version}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-[#0d121b]">
                {formatDate(doc.nextReviewDate)}
              </p>
              <p
                className={`text-xs mt-0.5 font-medium ${
                  daysLeft <= 0
                    ? "text-red-600"
                    : daysLeft <= 30
                      ? "text-amber-600"
                      : "text-green-600"
                }`}
              >
                {daysLeft <= 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft <= 30
                    ? `Due in ${daysLeft}d`
                    : `Due in ${daysLeft}d`}
              </p>
            </div>

            <span className="material-symbols-outlined text-[18px] text-[#e7ebf3] group-hover:text-[#6b7a99] transition-colors shrink-0">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const ReviewCalendar: React.FC<Props> = ({ onSelectDoc, onBack }) => {
  const { documents } = usePolicyDocuments();
  const [statsFilter, setStatsFilter] = useState<
    "ALL" | "OVERDUE" | "DUE_SOON" | "UP_TO_DATE"
  >("ALL");

  const { overdue, dueSoon, upToDate } = useMemo(() => {
    const reviewable = documents.filter(
      (d) => d.status === "approved" && d.nextReviewDate,
    );

    const overdue: ReviewItem[] = [];
    const dueSoon: ReviewItem[] = [];
    const upToDate: ReviewItem[] = [];

    reviewable.forEach((doc) => {
      const days = daysUntilDate(doc.nextReviewDate);
      if (days <= 0) overdue.push({ doc, daysLeft: days });
      else if (days <= 30) dueSoon.push({ doc, daysLeft: days });
      else upToDate.push({ doc, daysLeft: days });
    });

    overdue.sort((a, b) => a.daysLeft - b.daysLeft);
    dueSoon.sort((a, b) => a.daysLeft - b.daysLeft);
    upToDate.sort((a, b) => a.daysLeft - b.daysLeft);

    return { overdue, dueSoon, upToDate };
  }, [documents]);

  const totalReviewable = overdue.length + dueSoon.length + upToDate.length;

  const visibleOverdue =
    statsFilter === "ALL" || statsFilter === "OVERDUE" ? overdue : [];

  const visibleDueSoon =
    statsFilter === "ALL" || statsFilter === "DUE_SOON" ? dueSoon : [];

  const visibleUpToDate =
    statsFilter === "ALL" || statsFilter === "UP_TO_DATE" ? upToDate : [];

  return (
    <div className="min-h-full bg-[#f6f7fb]">
      {/* Header */}
      <div className="bg-[#F6F7FB] sm:px-8 px-4 sm:py-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to Library
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">
                event
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">
                Review Calendar
              </h1>
              <p className="text-base text-[#4c669a]">
                Track document review schedules and deadlines
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">
        {/* Summary bar */}
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Reviewable Docs"
            value={totalReviewable}
            icon="folder_managed"
            iconBg="bg-blue-50 text-blue-600"
            borderColor="#2563eb"
            trend="Library"
            active={statsFilter === "ALL"}
            onClick={() => setStatsFilter("ALL")}
          />

          <StatCard
            label="Overdue Reviews"
            value={overdue.length}
            icon="warning"
            iconBg="bg-red-50 text-red-500"
            borderColor="#ef4444"
            trend="Critical"
            active={statsFilter === "OVERDUE"}
            onClick={() => setStatsFilter("OVERDUE")}
          />

          <StatCard
            label="Due Soon"
            value={dueSoon.length}
            icon="schedule"
            iconBg="bg-amber-50 text-amber-500"
            borderColor="#f59e0b"
            trend="Attention"
            active={statsFilter === "DUE_SOON"}
            onClick={() => setStatsFilter("DUE_SOON")}
          />

          <StatCard
            label="Up to Date"
            value={upToDate.length}
            icon="check_circle"
            iconBg="bg-green-50 text-green-500"
            borderColor="#22c55e"
            trend="Compliant"
            active={statsFilter === "UP_TO_DATE"}
            onClick={() => setStatsFilter("UP_TO_DATE")}
          />
        </div>

        {/* ISO compliance note */}
        <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl sm:px-5 px-3 sm:py-4 py-3">
          <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">
            verified_user
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              ISO 9001 Document Review Requirement
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              ISO 9001:2015 Clause 7.5 requires that documents be reviewed for
              continuing suitability and adequacy. All approved documents must
              be reviewed at their scheduled frequency. Overdue reviews indicate
              a non-conformance.
            </p>
          </div>
        </div>

        {totalReviewable === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-[56px] text-[#e7ebf3] block mb-3">
              event_available
            </span>
            <p className="text-[#6b7a99]">
              No approved documents with review dates found.
            </p>
          </div>
        ) : (
          <>
            <Section
              title="Overdue Reviews"
              subtitle="These documents are past their review date — action required"
              items={visibleOverdue}
              accent="border-red-200"
              iconColor="bg-red-50 text-red-500"
              badgeCls="bg-red-100 text-red-700"
              icon="warning"
              onSelect={onSelectDoc}
              emptyText="No overdue reviews — great!"
            />
            <Section
              title="Due Soon"
              subtitle="Review due within the next 30 days"
              items={visibleDueSoon}
              accent="border-amber-200"
              iconColor="bg-amber-50 text-amber-500"
              badgeCls="bg-amber-100 text-amber-700"
              icon="schedule"
              onSelect={onSelectDoc}
              emptyText="Nothing due in the next 30 days."
            />
            <Section
              title="Up to Date"
              subtitle="Approved and within review schedule"
              items={visibleUpToDate}
              accent="border-[#e7ebf3]"
              iconColor="bg-green-50 text-green-500"
              badgeCls="bg-green-100 text-green-700"
              icon="check_circle"
              onSelect={onSelectDoc}
              emptyText="No documents currently up to date."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewCalendar;
