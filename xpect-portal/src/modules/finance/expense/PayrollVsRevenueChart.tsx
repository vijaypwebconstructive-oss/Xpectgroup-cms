import React from 'react';

const MOCK_DATA = [
  { label: 'Payroll Cost', value: 32100, barColor: 'bg-amber-500' },
  { label: 'Operational Expenses', value: 12450, barColor: 'bg-rose-500' },
  { label: 'Revenue from Invoices', value: 48500, barColor: 'bg-emerald-500' },
];

const PayrollVsRevenueChart: React.FC = () => {
  const maxValue = Math.max(...MOCK_DATA.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#0d121b] mb-4">Payroll vs Revenue</h3>
      <div className="space-y-3">
        {MOCK_DATA.map(({ label, value, barColor }) => {
          const pct = Math.round((value / maxValue) * 100);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-[#6b7a99] w-40 flex-shrink-0 font-medium">{label}</span>
              <div className="flex-1 h-6 bg-[#e7ebf3] rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg flex items-center px-2 transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(pct, 8)}%` }}
                >
                  <span className="text-white text-xs font-bold">£{value.toLocaleString('en-GB')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PayrollVsRevenueChart;
