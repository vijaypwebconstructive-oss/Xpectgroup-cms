import React, { useMemo } from 'react';
import { MOCK_DOCUMENTS, daysUntilDate } from './mockData';
import { PolicyDocument } from './types';

interface Props {
  onSelectDoc: (id: string) => void;
  onBack: () => void;
}

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface ReviewItem {
  doc: PolicyDocument;
  daysLeft: number;
}

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
  title, subtitle, items, accent, iconColor, badgeCls, icon, onSelect, emptyText,
}) => (
  <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${accent}`}>
    {/* Section header */}
    <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#0d121b]">{title}</h2>
          <p className="text-xs text-[#6b7a99]">{subtitle}</p>
        </div>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeCls}`}>
        {items.length}
      </span>
    </div>

    {items.length === 0 ? (
      <div className="px-6 py-10 text-center">
        <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">check_circle</span>
        <p className="text-sm text-[#6b7a99]">{emptyText}</p>
      </div>
    ) : (
      <div className="divide-y divide-[#e7ebf3]">
        {items.map(({ doc, daysLeft }) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[#f6f7fb] transition-colors group"
          >
            {/* Category dot */}
            <div className="w-2 h-2 rounded-full bg-current shrink-0 mt-1" style={{ color: 'inherit' }} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0d121b] truncate group-hover:text-[#2e4150]">
                {doc.title}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-[#6b7a99]">{doc.category}</span>
                <span className="text-xs text-[#6b7a99]">Owner: {doc.owner}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f0f2f7] text-[#2e4150] font-mono">
                  v{doc.version}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-[#0d121b]">{formatDate(doc.nextReviewDate)}</p>
              <p className={`text-xs mt-0.5 font-medium ${
                daysLeft <= 0  ? 'text-red-600' :
                daysLeft <= 30 ? 'text-amber-600' :
                'text-green-600'
              }`}>
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

  const { overdue, dueSoon, upToDate } = useMemo(() => {
    const reviewable = MOCK_DOCUMENTS.filter(
      d => d.status === 'approved' && d.nextReviewDate
    );

    const overdue:  ReviewItem[] = [];
    const dueSoon:  ReviewItem[] = [];
    const upToDate: ReviewItem[] = [];

    reviewable.forEach(doc => {
      const days = daysUntilDate(doc.nextReviewDate);
      if (days <= 0)       overdue.push({ doc, daysLeft: days });
      else if (days <= 30) dueSoon.push({ doc, daysLeft: days });
      else                 upToDate.push({ doc, daysLeft: days });
    });

    overdue.sort((a, b)  => a.daysLeft - b.daysLeft);
    dueSoon.sort((a, b)  => a.daysLeft - b.daysLeft);
    upToDate.sort((a, b) => a.daysLeft - b.daysLeft);

    return { overdue, dueSoon, upToDate };
  }, []);

  const totalReviewable = overdue.length + dueSoon.length + upToDate.length;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Library
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">event</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">Review Calendar</h1>
              <p className="text-sm text-[#6b7a99]">Track document review schedules and deadlines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
              <p className="text-xs text-[#6b7a99]">Overdue Reviews</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">schedule</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{dueSoon.length}</p>
              <p className="text-xs text-[#6b7a99]">Due Within 30 Days</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{upToDate.length}</p>
              <p className="text-xs text-[#6b7a99]">Up to Date</p>
            </div>
          </div>
        </div>

        {/* ISO compliance note */}
        <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">verified_user</span>
          <div>
            <p className="text-sm font-semibold text-white">ISO 9001 Document Review Requirement</p>
            <p className="text-xs text-white/70 mt-0.5">
              ISO 9001:2015 Clause 7.5 requires that documents be reviewed for continuing suitability and adequacy.
              All approved documents must be reviewed at their scheduled frequency. Overdue reviews indicate a non-conformance.
            </p>
          </div>
        </div>

        {totalReviewable === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-[56px] text-[#e7ebf3] block mb-3">event_available</span>
            <p className="text-[#6b7a99]">No approved documents with review dates found.</p>
          </div>
        ) : (
          <>
            <Section
              title="Overdue Reviews"
              subtitle="These documents are past their review date — action required"
              items={overdue}
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
              items={dueSoon}
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
              items={upToDate}
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
