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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued',     value: MOCK_PPE_RECORDS.length, color: 'text-[#0d121b]',   bar: 'bg-[#2e4150]', pct: 100,                                             icon: 'inventory_2',      iconColor: 'text-[#2e4150]' },
          { label: 'Valid',            value: valid,                   color: 'text-green-600',   bar: 'bg-green-500', pct: Math.round((valid / MOCK_PPE_RECORDS.length)*100),  icon: 'check_circle',     iconColor: 'text-green-600' },
          { label: 'Due Soon',         value: dueSoon,                 color: 'text-amber-500',   bar: 'bg-amber-400', pct: Math.round((dueSoon / MOCK_PPE_RECORDS.length)*100),icon: 'schedule',         iconColor: 'text-amber-500' },
          { label: 'Overdue',          value: overdue,                 color: 'text-red-600',     bar: 'bg-red-500',   pct: Math.round((overdue / MOCK_PPE_RECORDS.length)*100), icon: 'warning',          iconColor: 'text-red-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{c.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${c.iconColor}`}>{c.icon}</span>
            </div>
            <p className={`text-4xl font-black ${c.color}`}>{c.value}</p>
            <div className="h-1.5 rounded-full bg-[#e7ebf3] overflow-hidden">
              <div className={`h-full rounded-full ${c.bar} transition-all duration-500`} style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert banner */}
      {overdue > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-red-500 text-[22px]">warning</span>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-bold">{overdue} worker{overdue > 1 ? 's have' : ' has'} overdue PPE replacement</p>
            <p className="text-red-600 text-xs">Immediate action required to maintain compliance.</p>
          </div>
        </div>
      )}

      {/* Pending acknowledgement banner */}
      {pending > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px]">pending_actions</span>
          <p className="text-amber-800 text-sm font-bold">{pending} worker acknowledgement{pending > 1 ? 's' : ''} still pending</p>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3]">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-[#0d121b] text-base font-black">PPE Issuance Records</h2>
            <span className="text-xs font-bold bg-[#e7ebf3] text-[#4c669a] px-2.5 py-1 rounded-full">{filtered.length} records</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Worker search */}
            <label className="flex items-center h-9 bg-[#f6f6f8] rounded-lg px-3 border border-transparent focus-within:border-[#2e4150]/30 transition-all">
              <span className="material-symbols-outlined text-[#4c669a] text-[18px] mr-1">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#4c669a] text-sm outline-none w-32"
                placeholder="Search worker…"
                value={workerFilter}
                onChange={e => setWorkerFilter(e.target.value)}
              />
            </label>
            {/* PPE type filter */}
            <select
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as PPEItemType | '')}
            >
              <option value="">All PPE Types</option>
              {ALL_PPE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Status filter */}
            <select
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as PPEStatus | '')}
            >
              <option value="">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button
              onClick={onOpenIssue}
              className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Issue PPE
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
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
                const st = STATUS_STYLES[record.status];
                const icon = PPE_ITEM_ICONS[record.ppeType];
                const itemColor = PPE_ITEM_COLORS[record.ppeType];
                return (
                  <tr key={record.id} className="hover:bg-[#f8fafc] transition-colors group">
                    {/* Worker */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${record.workerAvatarColor} shrink-0 flex items-center justify-center`}>
                          <span className="text-white text-xs font-black">{record.workerInitials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0d121b]">{record.workerName}</p>
                          <p className="text-xs text-[#4c669a]">{record.workerLocation}</p>
                        </div>
                        {record.status === 'Overdue' && (
                          <span className="material-symbols-outlined text-red-500 text-[18px]" title="Overdue PPE">warning</span>
                        )}
                      </div>
                    </td>
                    {/* PPE Item */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${itemColor}`}>
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                        {record.ppeType}
                      </span>
                    </td>
                    {/* Issue Date */}
                    <td className="px-4 py-4 text-sm text-[#4c669a] font-medium">{formatDate(record.issueDate)}</td>
                    {/* Condition */}
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-[#0d121b]">{record.conditionAtIssue}</span>
                    </td>
                    {/* Next Replacement */}
                    <td className="px-4 py-4">
                      <span className={`text-sm font-semibold ${record.status === 'Overdue' ? 'text-red-600' : record.status === 'Due Soon' ? 'text-amber-600' : 'text-[#0d121b]'}`}>
                        {formatDate(record.nextReplacementDue)}
                      </span>
                    </td>
                    {/* Acknowledgement */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${ACK_STYLES[record.acknowledgement.status]}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {record.acknowledgement.status === 'Acknowledged' ? 'task_alt' : 'schedule'}
                        </span>
                        {record.acknowledgement.status}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onOpenDetail(record)}
                        className="text-[#2e4150] text-xs font-black uppercase tracking-wide hover:text-[#4c669a] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
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
          <button
            onClick={onOpenInventory}
            className="text-xs font-bold text-[#2e4150] hover:text-[#4c669a] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">inventory</span>
            View Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default PPEList;
