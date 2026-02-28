import React from 'react';
import { SiteIssue, IssueSeverity } from './types';

interface SiteComplianceWidgetProps {
  issues: SiteIssue[];
}

const severityConfig: Record<IssueSeverity, { badge: string; dot: string; label: string }> = {
  high: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'High' },
  medium: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Medium' },
  low: { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Low' },
};

const SiteComplianceWidget: React.FC<SiteComplianceWidgetProps> = ({ issues }) => {
  const highCount = issues.filter(i => i.severity === 'high').length;

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] flex flex-col">
      <div className="p-3 border-b border-[#e7ebf3] flex items-start sm:items-center gap-2 justify-between sm:flex-row flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2e4150]">location_city</span>
          <div>
            <h3 className="text-sm font-bold text-[#0d121b]">Site Compliance Issues</h3>
            <p className="text-xs text-[#6b7a99]">Sites requiring immediate action</p>
          </div>
        </div>
        {highCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {highCount} high risk
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-green-400 mb-2">check_circle</span>
          <p className="text-sm font-semibold text-[#0d121b]">All sites compliant</p>
          <p className="text-xs text-[#6b7a99] mt-1">No site compliance issues detected</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e7ebf3]">
                <th className="text-left p-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Site</th>
                <th className="text-left p-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Client</th>
                <th className="text-left p-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Issue</th>
                <th className="text-left p-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => {
                const cfg = severityConfig[issue.severity];
                return (
                  <tr key={issue.id} className="border-b border-[#e7ebf3] last:border-0 hover:bg-[#f5f7fa] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className="font-medium text-[#0d121b] whitespace-nowrap">{issue.site}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#6b7a99] whitespace-nowrap ">{issue.client}</td>
                    <td className="p-3 text-[#0d121b] max-w-xs min-w-[150px]">
                      <span className="text-sm leading-snug">{issue.issue}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SiteComplianceWidget;
