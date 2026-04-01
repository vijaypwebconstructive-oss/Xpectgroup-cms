
import React, { useState, useMemo } from 'react';
import { Sale, ClientType } from './types';

interface SalesTableProps {
  sales: Sale[];
}

const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  const [filter, setFilter] = useState<'ALL' | ClientType>('ALL');

  const filteredSales = useMemo(() => {
    if (filter === 'ALL') return sales;
    return sales.filter(sale => sale.type === filter);
  }, [sales, filter]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Recent Sales Transactions</h3>
          <p className="text-xs text-slate-400 mt-1">Showing {filteredSales.length} records</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter(ClientType.RECURRING)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === ClientType.RECURRING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Recurring
          </button>
          <button 
            onClick={() => setFilter(ClientType.ONE_TIME)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === ClientType.ONE_TIME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            One-time
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-medium">
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.slice(0, 15).map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">{sale.clientName}</td>
                <td className="px-6 py-4 text-slate-600">{sale.service}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    sale.type === ClientType.RECURRING 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {sale.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                £{sale.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No records found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex justify-between items-center px-6">
        <span className="text-xs text-slate-500 italic">* Displaying up to 15 latest entries</span>
        <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View Full Sales Ledger</button>
      </div>
    </div>
  );
};

export default SalesTable;
