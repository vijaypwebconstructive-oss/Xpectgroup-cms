import React, { useState, useMemo } from 'react';
import { MOCK_SDS, getChemicalById, daysUntil } from './mockData';
import { SDSStatus } from './types';

interface Props {
  onBack: () => void;
  onNavigateCOSHH: () => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status: SDSStatus) => {
  const map: Record<SDSStatus, { cls: string; label: string; icon: string }> = {
    valid:       { cls: 'bg-green-100 text-green-700 border border-green-200',  label: 'Valid',       icon: 'verified' },
    review_soon: { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Review Soon', icon: 'schedule' },
    expired:     { cls: 'bg-red-100 text-red-700 border border-red-200',        label: 'Expired',     icon: 'cancel' },
  };
  return map[status];
};

// Compute live status from reviewDate
const liveStatus = (sds: typeof MOCK_SDS[0]): SDSStatus => {
  const days = daysUntil(sds.reviewDate);
  if (days <= 0)  return 'expired';
  if (days <= 30) return 'review_soon';
  return 'valid';
};

const SDSLibrary: React.FC<Props> = ({ onBack, onNavigateCOSHH }) => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<SDSStatus | ''>('');

  const sdsList = useMemo(() => MOCK_SDS.map(s => ({ ...s, computedStatus: liveStatus(s) })), []);

  const filtered = useMemo(() => {
    let list = [...sdsList];
    if (search)       list = list.filter(s => s.chemicalName.toLowerCase().includes(search.toLowerCase()) || s.manufacturer.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter(s => s.computedStatus === statusFilter);
    return list;
  }, [sdsList, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      sdsList.length,
    valid:      sdsList.filter(s => s.computedStatus === 'valid').length,
    reviewSoon: sdsList.filter(s => s.computedStatus === 'review_soon').length,
    expired:    sdsList.filter(s => s.computedStatus === 'expired').length,
  }), [sdsList]);

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:max-w-full">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Risk Assessments
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">menu_book</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">SDS Library</h1>
              <p className="text-base text-[#4c669a]">Safety Data Sheets — all registered chemicals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onNavigateCOSHH}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">science</span>
              COSHH Register
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Upload SDS
            </button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total SDS',     value: stats.total,      icon: 'menu_book',  bg: 'bg-blue-50 text-blue-600' },
            { label: 'Valid',         value: stats.valid,      icon: 'verified',   bg: 'bg-green-50 text-green-600' },
            { label: 'Review Soon',   value: stats.reviewSoon, icon: 'schedule',   bg: 'bg-amber-50 text-amber-600' },
            { label: 'Expired',       value: stats.expired,    icon: 'cancel',     bg: 'bg-red-50 text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-start gap-3 flex-col">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
              <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{s.value}</p>
               
              {/* <div>
                
              </div> */}
            </div>
          ))}
        </div>

        {/* Expired alert */}
        {stats.expired > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">warning</span>
            <div>
              <p className="text-sm font-bold text-red-700">Expired SDS Sheets Detected</p>
              <p className="text-xs text-red-600 mt-0.5">
                {stats.expired} SDS document{stats.expired > 1 ? 's' : ''} have expired. Under COSHH regulations, SDS must be kept current (max 3 years). Request updated documents from manufacturers immediately.
              </p>
            </div>
          </div>
        )}

        {/* ISO info bar */}
        <div className="flex items-start gap-3 bg-[#2e4150] rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-white/70 text-[20px] shrink-0 mt-0.5">verified_user</span>
          <div>
            <p className="text-sm font-semibold text-white">REACH & COSHH Compliance</p>
            <p className="text-xs text-white/70 mt-0.5">
              Safety Data Sheets must comply with REACH Regulation (EC) No 1907/2006 Annex II and be updated whenever significant new information becomes available. Sheets older than 3 years should be refreshed.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search chemical or manufacturer…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as SDSStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[150px] ">
            <option value="">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="review_soon">Review Soon</option>
            <option value="expired">Expired</option>
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
                  {['Chemical Name', 'Manufacturer', 'Revision', 'Issue Date', 'Review Date', 'Status', 'File', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">menu_book</span>
                      <p className="text-[#6b7a99] font-medium">No SDS documents found</p>
                    </td></tr>
                  )
                  : filtered.map(s => {
                    const sb = statusBadge(s.computedStatus);
                    const chemical = getChemicalById(s.chemicalId);
                    const days = daysUntil(s.reviewDate);
                    return (
                      <tr key={s.id} className="hover:bg-[#f6f7fb] transition-colors">
                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            {/* <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">picture_as_pdf</span> */}
                            <div>
                              <p className="font-semibold text-[#0d121b]">{s.chemicalName}</p>
                              {chemical && <p className="text-xs text-[#6b7a99]">{chemical.hazardType}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{s.manufacturer}</td>
                        <td className="px-4 py-4 text-[#0d121b] font-mono text-xs">{s.revision}</td>
                        <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{fmt(s.issueDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${days <= 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-[#6b7a99]'}`}>
                            {fmt(s.reviewDate)}
                          </span>
                          {days > 0 && days <= 30 && <p className="text-[10px] text-amber-500 mt-0.5">In {days}d</p>}
                          {days <= 0 && <p className="text-[10px] text-red-500 mt-0.5">{Math.abs(days)}d overdue</p>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                            {/* <span className="material-symbols-outlined text-[14px]">{sb.icon}</span> */}
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {s.fileName
                            ? <span className="text-xs text-[#6b7a99] truncate max-w-[120px] block">{s.fileName}</span>
                            : <span className="text-xs text-red-500 font-medium">Not uploaded</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-right">
                          {s.fileName
                            ? <button className="text-sm font-semibold text-[#2e4150] hover:underline">Download</button>
                            : <button className="text-sm font-semibold text-red-600 hover:underline">Upload</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {MOCK_SDS.length} SDS documents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SDSLibrary;
