import React from 'react';
import { DocumentSummary } from './types';
import { docNavigate } from '../document-control/docNavStore';

interface DocumentStatusWidgetProps {
  summary: DocumentSummary;
  onNavigateToDocControl: () => void;
}

const DocumentStatusWidget: React.FC<DocumentStatusWidgetProps> = ({ summary, onNavigateToDocControl }) => {
  const categories = [
    {
      label: 'Approved',
      count: summary.approved,
      icon: 'check_circle',
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
      barColor: 'bg-green-500',
    },
    {
      label: 'Pending Approval',
      count: summary.pending,
      icon: 'pending',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700',
      barColor: 'bg-amber-500',
    },
    {
      label: 'Expired',
      count: summary.expired,
      icon: 'cancel',
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-700',
      barColor: 'bg-red-500',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] flex flex-col">
      <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2e4150]">folder_managed</span>
          <div>
            <h3 className="text-sm font-bold text-[#0d121b]">Document Status</h3>
            <p className="text-xs text-[#6b7a99]">{summary.total} company policies tracked</p>
          </div>
        </div>
        {summary.expired > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {summary.expired} expired
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Status bars */}
        <div className="space-y-3">
          {categories.map(cat => {
            const pct = summary.total > 0 ? Math.round((cat.count / summary.total) * 100) : 0;
            return (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[16px] ${cat.iconColor}`}>{cat.icon}</span>
                    <span className="text-sm font-medium text-[#0d121b]">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${cat.textColor}`}>{cat.count}</span>
                    <span className="text-xs text-[#6b7a99]">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[#e7ebf3] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cat.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {categories.map(cat => (
            <div key={cat.label} className={`rounded-lg p-3 text-center border ${cat.bg} ${cat.border}`}>
              <p className={`text-2xl font-bold ${cat.textColor}`}>{cat.count}</p>
              <p className="text-xs text-[#6b7a99] mt-0.5">{cat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick link */}
        <button
          onClick={() => {
            docNavigate('library');
            onNavigateToDocControl();
          }}
          className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] hover:bg-[#f5f7fa] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          View Document Control
        </button>
      </div>
    </div>
  );
};

export default DocumentStatusWidget;
