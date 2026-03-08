import React from 'react';

const MOCK_ACTIVITY = [
  { id: '1', date: '08 Feb 2026', category: 'Cleaning Supplies', amount: 245.50, status: 'Approved' as const, employee: 'John Smith' },
  { id: '2', date: '07 Feb 2026', category: 'Travel & Fuel', amount: 89.20, status: 'Pending' as const, employee: 'Sarah Jones' },
  { id: '3', date: '06 Feb 2026', category: 'Equipment Maintenance', amount: 520.00, status: 'Approved' as const, employee: 'Mike Wilson' },
  { id: '4', date: '05 Feb 2026', category: 'PPE & Uniform', amount: 156.75, status: 'Approved' as const, employee: 'Emma Brown' },
  { id: '5', date: '04 Feb 2026', category: 'Office Expenses', amount: 78.00, status: 'Rejected' as const, employee: 'David Lee' },
];

const STATUS_STYLE: Record<string, string> = {
  Approved: 'bg-green-50 text-green-700 border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

const RecentExpenseActivity: React.FC = () => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-[#e7ebf3]">
      <h3 className="text-sm font-bold text-[#0d121b]">Recent Expense Activity</h3>
      <p className="text-xs text-[#6b7a99] mt-0.5">Latest expense records and approvals</p>
    </div>
    <div className="divide-y divide-[#e7ebf3]">
      {MOCK_ACTIVITY.map(row => (
        <div key={row.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 hover:bg-[#f8f9fc] transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0d121b]">{row.category}</p>
            <p className="text-xs text-[#6b7a99]">{row.employee} • {row.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#0d121b]">
              £{row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_STYLE[row.status] || ''}`}>
              {row.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentExpenseActivity;
