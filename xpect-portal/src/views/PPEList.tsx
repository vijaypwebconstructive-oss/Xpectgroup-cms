import React, { useState } from 'react';
import { PPEIssueRecord, PPEItemType, PPEStatus } from '../types';
import { MOCK_PPE_RECORDS, PPE_ITEM_ICONS, PPE_ITEM_COLORS, ALL_PPE_TYPES } from './ppeData';

interface PPEListProps {
  onOpenDetail: (record: PPEIssueRecord) => void;
  onOpenIssue: () => void;
  onOpenInventory: () => void;
}

const STATUS_STYLES: Record<PPEStatus, { badge: string; dot: string; label: string }> = {
  Valid:      { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  label: 'Valid' },
  'Due Soon': { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400',  label: 'Due Soon' },
  Overdue:    { badge: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    label: 'Overdue' },
};

const ACK_STYLES = {
  Acknowledged: 'bg-green-100 text-green-700',
  Pending:      'bg-gray-100 text-gray-500',
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const PPEList: React.FC<PPEListProps> = ({ onOpenDetail, onOpenIssue, onOpenInventory }) => {
  const [workerFilter, setWorkerFilter]   = useState('');
  const [typeFilter, setTypeFilter]       = useState<PPEItemType | ''>('');
  const [statusFilter, setStatusFilter]   = useState<PPEStatus | ''>('');

  const overdue   = MOCK_PPE_RECORDS.filter(r => r.status === 'Overdue').length;
  const dueSoon   = MOCK_PPE_RECORDS.filter(r => r.status === 'Due Soon').length;
  const valid     = MOCK_PPE_RECORDS.filter(r => r.status === 'Valid').length;
  const pending   = MOCK_PPE_RECORDS.filter(r => r.acknowledgement.status === 'Pending').length;

  const filtered = MOCK_PPE_RECORDS.filter(r => {
    const matchWorker = workerFilter === '' || r.workerName.toLowerCase().includes(workerFilter.toLowerCase());
    const matchType   = typeFilter === '' || r.ppeType === typeFilter;
    const matchStatus = statusFilter === '' || r.status === statusFilter;
    return matchWorker && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        {[
          { label: 'Total Issued', value: MOCK_PPE_RECORDS.length, icon: 'inventory_2',  iconColor: 'text-[#2e4150]' },
          { label: 'Valid',        value: valid,                   icon: 'check_circle', iconColor: 'text-green-600' },
          { label: 'Due Soon',     value: dueSoon,                 icon: 'schedule',     iconColor: 'text-amber-500' },
          { label: 'Overdue',      value: overdue,                 icon: 'warning',      iconColor: 'text-red-600'   },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm sm:p-4 p-3 flex flex-col gap-3 items-start relative">
          <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${c.iconColor}`}>{c.icon}</span>
          <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{c.label}</p>
          <p className="sm:text-[30px] text-xl font-bold text-[#000]">{c.value}</p>
          
            {/* <div className="flex flex-col gap-1 sm:gap-2 justify-between items-left">
              
              
            </div> */}
          </div>
        ))}
      </div>

      {/* Overdue alert banner */}
      {overdue > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-bold">{overdue} worker{overdue > 1 ? 's have' : ' has'} overdue PPE replacement</p>
            <p className="text-red-600 text-xs mt-0.5">Immediate action required to maintain safety compliance.</p>
          </div>
        </div>
      )}

      {/* Pending acknowledgement banner */}
      {pending > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px]">pending</span>
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-bold">{pending} acknowledgement{pending > 1 ? 's' : ''} pending</p>
            <p className="text-amber-600 text-xs mt-0.5">Workers have not yet confirmed receipt of their PPE.</p>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[160px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search worker name..."
                value={workerFilter}
                onChange={e => setWorkerFilter(e.target.value)}
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as PPEItemType | '')}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All PPE Types</option>
              {ALL_PPE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as PPEStatus | '')}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenInventory}
              className="flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white text-[#0d121b] text-xs font-bold hover:bg-[#f6f6f8] transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Inventory
            </button>
            <button
              onClick={onOpenIssue}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Issue PPE
            </button>
          </div>
        </div>

        {/* Table header with count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm font-black">PPE Issuance Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Worker Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">PPE Item</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Issue Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Next Replacement</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Acknowledgement</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No records match your filters</p>
                  </td>
                </tr>
              ) : filtered.map(record => {
                const st   = STATUS_STYLES[record.status];
                const icon = PPE_ITEM_ICONS[record.ppeType];
                const itemColor = PPE_ITEM_COLORS[record.ppeType];
                const ackStyle  = ACK_STYLES[record.acknowledgement.status];
                return (
                  <tr key={record.id} className="hover:bg-[#f8fafc] transition-colors group">
                    {/* Worker */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${record.workerAvatarColor} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-xs font-black">{record.workerInitials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0d121b]">{record.workerName}</p>
                          <p className="text-xs text-[#4c669a]">{record.workerLocation}</p>
                        </div>
                      </div>
                    </td>
                    {/* PPE Item */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${itemColor}`}>
                        <span className="material-symbols-outlined text-[14px]">{icon}</span>
                        {record.ppeType}
                      </span>
                    </td>
                    {/* Issue Date */}
                    <td className="px-4 py-4 text-sm text-[#4c669a] font-medium whitespace-nowrap">{formatDate(record.issueDate)}</td>
                    {/* Condition */}
                    <td className="px-4 py-4 text-sm font-medium text-[#0d121b]">{record.conditionAtIssue}</td>
                    {/* Next Replacement */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${record.status === 'Overdue' ? 'text-red-600' : record.status === 'Due Soon' ? 'text-amber-600' : 'text-[#0d121b]'}`}>
                        {formatDate(record.nextReplacementDue)}
                      </span>
                    </td>
                    {/* Acknowledgement */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${ackStyle}`}>
                        {record.acknowledgement.status}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black font-semibold uppercase tracking-wide ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onOpenDetail(record)}
                        className="text-[#4c669a] text-xs font-black capitalize tracking-wide transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{MOCK_PPE_RECORDS.length}</span> records
          </p>
        </div>
      </div>
    </div>
  );
};

export default PPEList;
