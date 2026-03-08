import React from 'react';

const STATUS_BADGE: Record<string, string> = {
  Approved: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const MOCK_ROWS = [
  { id: '1', date: '08 Feb 2026', category: 'Cleaning Supplies', site: 'Acme Corp - HQ', employee: 'John Smith', description: 'Floor cleaner, mops', amount: 245.50, status: 'Approved' as const },
  { id: '2', date: '07 Feb 2026', category: 'Travel & Fuel', site: 'Metro Healthcare', employee: 'Sarah Jones', description: 'Mileage claim', amount: 89.20, status: 'Pending' as const },
  { id: '3', date: '06 Feb 2026', category: 'Equipment Maintenance', site: 'City Schools', employee: 'Mike Wilson', description: 'Vacuum repair', amount: 520.00, status: 'Approved' as const },
  { id: '4', date: '05 Feb 2026', category: 'PPE & Uniform', site: 'Tech Park', employee: 'Emma Brown', description: 'Safety boots', amount: 156.75, status: 'Approved' as const },
  { id: '5', date: '04 Feb 2026', category: 'Office Expenses', site: 'Green Valley Mall', employee: 'David Lee', description: 'Stationery', amount: 78.00, status: 'Pending' as const },
];

const ExpenseListTable: React.FC = () => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-[#f6f6f8] border-b border-[#e7ebf3]">
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Date</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Category</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Site</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Employee</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Description</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Amount</th>
            <th className="text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wider px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ROWS.map(row => (
            <tr key={row.id} className="border-b border-[#e7ebf3] hover:bg-[#f8f9fc] transition-colors">
              <td className="px-4 py-3 text-sm text-[#4c669a]">{row.date}</td>
              <td className="px-4 py-3 text-sm text-[#0d121b]">{row.category}</td>
              <td className="px-4 py-3 text-sm text-[#4c669a]">{row.site}</td>
              <td className="px-4 py-3 text-sm text-[#0d121b]">{row.employee}</td>
              <td className="px-4 py-3 text-sm text-[#6b7a99] max-w-[200px] truncate" title={row.description}>{row.description}</td>
              <td className="px-4 py-3 text-sm font-semibold text-[#0d121b]">
                £{row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_BADGE[row.status] || ''}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ExpenseListTable;
