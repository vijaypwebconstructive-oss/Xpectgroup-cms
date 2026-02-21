import React from 'react';
import { IncidentSummary } from './types';

interface IncidentSummaryWidgetProps {
  summary: IncidentSummary;
}

const IncidentSummaryWidget: React.FC<IncidentSummaryWidgetProps> = ({ summary }) => {
  const stats = [
    {
      label: 'Open',
      count: summary.open,
      icon: 'report_problem',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      barColor: 'bg-red-500',
    },
    {
      label: 'Investigating',
      count: summary.investigating,
      icon: 'manage_search',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      barColor: 'bg-amber-500',
    },
    {
      label: 'Overdue Actions',
      count: summary.overdueActions,
      icon: 'alarm',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      barColor: 'bg-orange-500',
    },
  ];

  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] flex flex-col">
      <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-red-600">crisis_alert</span>
          <div>
            <h3 className="text-sm font-bold text-[#0d121b]">Incident Summary</h3>
            <p className="text-xs text-[#6b7a99]">{summary.total} total incidents recorded</p>
          </div>
        </div>
        {summary.overdueActions > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">alarm</span>
            {summary.overdueActions} overdue
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {stats.map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 border text-center ${stat.bg} ${stat.border}`}>
              <div className={`flex justify-center mb-2`}>
                <span className={`material-symbols-outlined text-[24px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-[#6b7a99] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Simple bar chart */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wider mb-3">Visual Breakdown</p>
          {stats.map(stat => {
            const pct = Math.round((stat.count / maxCount) * 100);
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="text-xs text-[#6b7a99] w-28 flex-shrink-0 font-medium">{stat.label}</span>
                <div className="flex-1 h-6 bg-[#e7ebf3] rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg flex items-center px-2 transition-all duration-700 ${stat.barColor}`}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    <span className="text-white text-xs font-bold">{stat.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total closed implied */}
        <div className="mt-4 pt-4 border-t border-[#e7ebf3] flex items-center justify-between">
          <span className="text-xs text-[#6b7a99]">Closed incidents</span>
          <span className="text-sm font-bold text-green-600">
            {summary.total - summary.open - summary.investigating}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncidentSummaryWidget;
