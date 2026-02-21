import React from 'react';
import { PPEIssueRecord, PPEStatus } from '../types';
import { PPE_ITEM_ICONS, PPE_ITEM_COLORS } from './ppeData';

interface PPEDetailProps {
  record: PPEIssueRecord;
  onBack: () => void;
}

const STATUS_STYLES: Record<PPEStatus, { badge: string; dot: string }> = {
  Valid:      { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'Due Soon': { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  Overdue:    { badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return d; }
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-[#e7ebf3] last:border-0">
    <span className="text-sm font-semibold text-[#4c669a] w-44 shrink-0">{label}</span>
    <span className="text-sm font-bold text-[#0d121b] text-right flex-1">{value}</span>
  </div>
);

const PPEDetail: React.FC<PPEDetailProps> = ({ record, onBack }) => {
  const st = STATUS_STYLES[record.status];
  const icon = PPE_ITEM_ICONS[record.ppeType];
  const itemColor = PPE_ITEM_COLORS[record.ppeType];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-[#4c669a] text-sm font-bold hover:text-[#0d121b] transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Records
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${record.workerAvatarColor} flex items-center justify-center shrink-0`}>
              <span className="text-white text-lg font-black">{record.workerInitials}</span>
            </div>
            <div>
              <h2 className="text-[#0d121b] text-xl font-black">{record.workerName}</h2>
              <p className="text-[#4c669a] text-sm">{record.workerLocation}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${itemColor}`}>
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {record.ppeType}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-black uppercase tracking-wide ${st.badge}`}>
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              {record.status}
            </span>
          </div>
        </div>

        {/* Overdue alert */}
        {record.status === 'Overdue' && (
          <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
            <div>
              <p className="text-red-800 text-sm font-black">PPE Replacement Required</p>
              <p className="text-red-600 text-xs">This equipment is overdue for replacement. Please issue new PPE immediately.</p>
            </div>
          </div>
        )}

        {/* Due Soon alert */}
        {record.status === 'Due Soon' && (
          <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-amber-500 text-[22px]">schedule</span>
            <p className="text-amber-800 text-sm font-bold">Replacement due soon — schedule before {formatDate(record.nextReplacementDue)}</p>
          </div>
        )}
      </div>

      {/* Section A — Issue Information */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2e4150] text-[20px]">info</span>
          <h3 className="text-[#0d121b] text-sm font-black uppercase tracking-wide">A. Issue Information</h3>
        </div>
        <div className="px-6">
          <InfoRow label="Issue Date"         value={formatDate(record.issueDate)} />
          <InfoRow label="Issued By"          value={record.issuedBy} />
          <InfoRow label="Size"               value={record.size} />
          <InfoRow label="Condition at Issue" value={record.conditionAtIssue} />
          <InfoRow label="Replacement Period" value={`${record.replacementPeriodMonths} months`} />
          {record.notes && <InfoRow label="Notes" value={record.notes} />}
        </div>
      </div>

      {/* Section B — Replacement Tracking */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2e4150] text-[20px]">autorenew</span>
          <h3 className="text-[#0d121b] text-sm font-black uppercase tracking-wide">B. Replacement Tracking</h3>
        </div>
        <div className="px-6 pb-2">
          <InfoRow
            label="Next Replacement Due"
            value={
              <span className={record.status === 'Overdue' ? 'text-red-600' : record.status === 'Due Soon' ? 'text-amber-600' : 'text-[#0d121b]'}>
                {formatDate(record.nextReplacementDue)}
              </span>
            }
          />
        </div>

        {/* Replacement history timeline */}
        <div className="px-6 pb-5">
          <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide mb-3">Replacement History</p>
          {record.replacementHistory.length === 0 ? (
            <p className="text-sm text-[#4c669a] italic">No replacement history — this is the initial issuance.</p>
          ) : (
            <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-[#e7ebf3]">
              {record.replacementHistory.map((h, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div className="absolute -left-[14px] w-3 h-3 rounded-full bg-[#2e4150] border-2 border-white shrink-0 mt-0.5" />
                  <div className="ml-1">
                    <p className="text-sm font-bold text-[#0d121b]">{h.reason}</p>
                    <p className="text-xs text-[#4c669a]">{formatDate(h.date)} · Issued by {h.issuedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section C — Worker Acknowledgement */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e7ebf3] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2e4150] text-[20px]">draw</span>
          <h3 className="text-[#0d121b] text-sm font-black uppercase tracking-wide">C. Worker Acknowledgement</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#4c669a]">Acknowledgement Status</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
              record.acknowledgement.status === 'Acknowledged'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {record.acknowledgement.status === 'Acknowledged' ? 'task_alt' : 'schedule'}
              </span>
              {record.acknowledgement.status}
            </span>
          </div>

          {/* Acknowledgement date */}
          {record.acknowledgement.acknowledgedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#4c669a]">Acknowledged On</span>
              <span className="text-sm font-bold text-[#0d121b]">{formatDate(record.acknowledgement.acknowledgedAt)}</span>
            </div>
          )}

          {/* Signature placeholder */}
          <div className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 ${
            record.acknowledgement.status === 'Acknowledged'
              ? 'border-green-300 bg-green-50'
              : 'border-[#c7d2e0] bg-[#f8fafc]'
          }`}>
            {record.acknowledgement.status === 'Acknowledged' ? (
              <>
                <span className="material-symbols-outlined text-green-500 text-[32px]">task_alt</span>
                <p className="text-green-700 text-sm font-bold">Worker signature on file</p>
                <p className="text-green-600 text-xs">{record.workerName} · {formatDate(record.acknowledgement.acknowledgedAt || '')}</p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[#4c669a] text-[32px]">gesture</span>
                <p className="text-[#4c669a] text-sm font-semibold">Awaiting worker signature</p>
                <p className="text-[#4c669a] text-xs">Worker has not yet acknowledged receipt</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f2f6f9] transition-all cursor-pointer"
        >
          Close
        </button>
        <button
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print Record
        </button>
      </div>
    </div>
  );
};

export default PPEDetail;
