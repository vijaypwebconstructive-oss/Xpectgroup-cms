import React from 'react';

const MOCK_DATA = [
  { site: 'Acme Corp - HQ', amount: 8500, barColor: 'bg-[#2e4150]' },
  { site: 'Metro Healthcare', amount: 6200, barColor: 'bg-[#3b82f6]' },
  { site: 'City Schools Ltd', amount: 4800, barColor: 'bg-[#22c55e]' },
  { site: 'Tech Park Offices', amount: 4100, barColor: 'bg-[#f59e0b]' },
  { site: 'Green Valley Mall', amount: 2650, barColor: 'bg-[#8b5cf6]' },
];

const ExpenseByClientSiteChart: React.FC = () => {
  const maxAmount = Math.max(...MOCK_DATA.map(d => d.amount), 1);

  return (
    <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#0d121b] mb-4">Expense by Client Site</h3>
      <div className="space-y-3">
        {MOCK_DATA.map(({ site, amount, barColor }) => {
          const pct = Math.round((amount / maxAmount) * 100);
          return (
            <div key={site} className="flex items-center gap-3">
              <span className="text-xs text-[#6b7a99] w-40 flex-shrink-0 font-medium truncate" title={site}>{site}</span>
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

export default ExpenseByClientSiteChart;
