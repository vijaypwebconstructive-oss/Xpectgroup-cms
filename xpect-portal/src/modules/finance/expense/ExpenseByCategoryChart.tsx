import React from 'react';

const MOCK_DATA = [
  { category: 'Cleaning Supplies', amount: 4200, barColor: 'bg-blue-500' },
  { category: 'Equipment Maintenance', amount: 3100, barColor: 'bg-emerald-500' },
  { category: 'Travel & Fuel', amount: 1850, barColor: 'bg-amber-500' },
  { category: 'PPE & Uniform', amount: 2400, barColor: 'bg-violet-500' },
  { category: 'Office Expenses', amount: 900, barColor: 'bg-rose-500' },
];

const ExpenseByCategoryChart: React.FC = () => {
  const maxAmount = Math.max(...MOCK_DATA.map(d => d.amount), 1);

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#0d121b] mb-4">Expense by Category</h3>
      <div className="space-y-3">
        {MOCK_DATA.map(({ category, amount, barColor }) => {
          const pct = Math.round((amount / maxAmount) * 100);
          return (
            <div key={category} className="flex items-center gap-3">
              <span className="text-xs text-[#6b7a99] w-36 flex-shrink-0 font-medium">{category}</span>
              <div className="flex-1 h-6 bg-[#e7ebf3] rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg flex items-center px-2 transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(pct, 8)}%` }}
                >
                  <span className="text-white text-xs font-bold">£{amount.toLocaleString('en-GB')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseByCategoryChart;
