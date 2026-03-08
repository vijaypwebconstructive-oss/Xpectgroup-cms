import React from 'react';

const MOCK_MONTHS = [
  { month: 'Sep', amount: 38500 },
  { month: 'Oct', amount: 41200 },
  { month: 'Nov', amount: 39800 },
  { month: 'Dec', amount: 43500 },
  { month: 'Jan', amount: 44800 },
  { month: 'Feb', amount: 48250 },
];

const MonthlyExpenseTrendChart: React.FC = () => {
  const maxAmount = Math.max(...MOCK_MONTHS.map(d => d.amount), 1);

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#0d121b] mb-4">Monthly Expense Trend</h3>
      <div className="flex items-end gap-2 h-32">
        {MOCK_MONTHS.map(({ month, amount }) => {
          const pct = Math.round((amount / maxAmount) * 100);
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className="w-full bg-[#2e4150] rounded-t transition-all duration-500 min-h-[8px]"
                  style={{ height: `${Math.max(pct, 5)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#6b7a99]">{month}</span>
              <span className="text-xs font-semibold text-[#0d121b]">£{(amount / 1000).toFixed(1)}k</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyExpenseTrendChart;
