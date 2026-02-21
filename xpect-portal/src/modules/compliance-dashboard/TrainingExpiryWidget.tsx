import React from 'react';
import { TrainingExpiry } from './types';

interface TrainingExpiryWidgetProps {
  records: TrainingExpiry[];
}

const TrainingExpiryWidget: React.FC<TrainingExpiryWidgetProps> = ({ records }) => {
  const getRowStyle = (days: number) => {
    if (days <= 7) return { row: 'bg-red-50', badge: 'bg-red-100 text-red-700', text: 'text-red-700' };
    if (days <= 30) return { row: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' };
    return { row: '', badge: 'bg-green-100 text-green-700', text: 'text-green-700' };
  };

  const criticalCount = records.filter(r => r.daysRemaining <= 7).length;

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] flex flex-col">
      <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-amber-600">school</span>
          <div>
            <h3 className="text-sm font-bold text-[#0d121b]">Training Expiry</h3>
            <p className="text-xs text-[#6b7a99]">Expiring within 30 days</p>
          </div>
        </div>
        {criticalCount > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {criticalCount} urgent
          </span>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-green-400 mb-2">check_circle</span>
          <p className="text-sm font-semibold text-[#0d121b]">All training up to date</p>
          <p className="text-xs text-[#6b7a99] mt-1">No certificates expiring in the next 30 days</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e7ebf3]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Training</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Expiry Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7a99] uppercase tracking-wider">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => {
                const style = getRowStyle(record.daysRemaining);
                return (
                  <tr key={record.id} className={`border-b border-[#e7ebf3] last:border-0 ${style.row}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2e4150] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{record.employee.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-[#0d121b]">{record.employee}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0d121b]">{record.training}</td>
                    <td className="px-5 py-3 text-[#6b7a99]">
                      {new Date(record.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.badge}`}>
                        {record.daysRemaining} days
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

export default TrainingExpiryWidget;
