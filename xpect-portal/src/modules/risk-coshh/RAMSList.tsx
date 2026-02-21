import React, { useState, useMemo } from 'react';
import { MOCK_RAMS } from './mockData';
import { RAMSStatus } from './types';

interface Props {
  onSelectRAMS: (id: string) => void;
  onBack: () => void;
}

const statusBadge = (status: RAMSStatus) => {
  const map: Record<RAMSStatus, { cls: string; label: string }> = {
    approved:        { cls: 'bg-green-100 text-green-700 border border-green-200',  label: 'Approved' },
    draft:           { cls: 'bg-gray-100 text-gray-600 border border-gray-200',     label: 'Draft' },
    review_required: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Review Required' },
  };
  return map[status];
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Skeleton = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
    ))}
  </tr>
);

const RAMSList: React.FC<Props> = ({ onSelectRAMS, onBack }) => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<RAMSStatus | ''>('');

  const filtered = useMemo(() => {
    let list = [...MOCK_RAMS];
    if (search)       list = list.filter(r => r.siteName.toLowerCase().includes(search.toLowerCase()) || r.clientName.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    return list;
  }, [search, statusFilter]);

  const stats = { total: MOCK_RAMS.length, approved: MOCK_RAMS.filter(r => r.status === 'approved').length, draft: MOCK_RAMS.filter(r => r.status === 'draft').length };

  return (
    <div className="min-h-full bg-[#f6f7fb]">
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Risk Assessments
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">assignment</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">RAMS — Method Statements</h1>
              <p className="text-sm text-[#6b7a99]">Risk Assessment & Method Statements linked to client sites</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add RAMS
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total RAMS',  value: stats.total,    icon: 'assignment',    bg: 'bg-blue-50 text-blue-600' },
            { label: 'Approved',    value: stats.approved, icon: 'verified',      bg: 'bg-green-50 text-green-600' },
            { label: 'Draft',       value: stats.draft,    icon: 'draft',         bg: 'bg-gray-100 text-gray-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-[#0d121b]">{s.value}</p>
                <p className="text-xs text-[#6b7a99]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search site or client…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as RAMSStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[160px]">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="review_required">Review Required</option>
            <option value="draft">Draft</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatus(''); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {['Site Name', 'Client', 'Work Description', 'Working Hours', 'Last Updated', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
                      <p className="text-[#6b7a99] font-medium">No RAMS found</p>
                    </td></tr>
                  )
                  : filtered.map(r => {
                    const sb = statusBadge(r.status);
                    return (
                      <tr key={r.id} onClick={() => onSelectRAMS(r.id)} className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">location_on</span>
                            <span className="font-semibold text-[#0d121b]">{r.siteName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{r.clientName}</td>
                        <td className="px-4 py-4 text-[#0d121b] max-w-[200px] truncate">{r.description}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{r.workingHours}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{fmt(r.lastUpdated)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>{sb.label}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-[#2e4150] hover:underline">View</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAMSList;
