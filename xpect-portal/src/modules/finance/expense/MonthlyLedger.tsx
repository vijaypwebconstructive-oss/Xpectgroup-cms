
import React from 'react';
import { MonthlyMetric } from './types';

interface MonthlyLedgerProps {
  metrics: MonthlyMetric[];
}

const MonthlyLedger: React.FC<MonthlyLedgerProps> = ({ metrics }) => {
  const formatGBP = (val: number) => 
    new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP', 
      maximumFractionDigits: 0 
    }).format(val);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
      <div className="p-6 border-b border-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Monthly Revenue Performance Summary</h3>
        <p className="text-xs text-slate-400 mt-1">Full breakdown of agency earnings by month.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium">
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4 text-right">Recurring (MRR)</th>
              <th className="px-6 py-4 text-right">One-time</th>
              <th className="px-6 py-4 text-right font-bold text-indigo-600">Total Revenue</th>
              <th className="px-6 py-4 text-center">MoM Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {metrics.map((metric, idx) => {
              const prevMetric = idx > 0 ? metrics[idx - 1] : null;
              const growth = prevMetric ? ((metric.total - prevMetric.total) / prevMetric.total) * 100 : 0;
              
              return (
                <tr key={metric.month} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{metric.month}</td>
                  <td className="px-6 py-4 text-right">{formatGBP(metric.recurring)}</td>
                  <td className="px-6 py-4 text-right">{formatGBP(metric.oneTime)}</td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-900">{formatGBP(metric.total)}</td>
                  <td className="px-6 py-4 text-center">
                    {prevMetric ? (
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-medium italic">Baseline</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyLedger;
