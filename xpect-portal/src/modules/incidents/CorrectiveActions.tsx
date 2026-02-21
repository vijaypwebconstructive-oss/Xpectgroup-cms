import React, { useState, useMemo } from 'react';
import { MOCK_ACTIONS, MOCK_INCIDENTS, daysUntil } from './mockData';
import { ActionStatus } from './types';

interface Props {
  onBack: () => void;
  onSelectIncident: (id: string) => void;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status: ActionStatus, overdue: boolean) => {
  if (status === 'Completed')   return { cls: 'bg-green-100 text-green-700 border border-green-200',  icon: 'check_circle',           label: 'Completed' };
  if (status === 'In Progress') return { cls: 'bg-amber-100 text-amber-700 border border-amber-200',  icon: 'hourglass_top',          label: 'In Progress' };
  if (overdue)                  return { cls: 'bg-red-200 text-red-800 border border-red-400',         icon: 'error',                  label: 'Overdue' };
  return                               { cls: 'bg-red-100 text-red-700 border border-red-200',         icon: 'radio_button_unchecked', label: 'Open' };
};

const Skeleton = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
    ))}
  </tr>
);

const CorrectiveActions: React.FC<Props> = ({ onBack, onSelectIncident }) => {
  const [statusFilter, setStatus] = useState<ActionStatus | ''>('');
  const [search, setSearch]       = useState('');

  const enriched = useMemo(() => MOCK_ACTIONS.map(a => ({
    ...a,
    incident: MOCK_INCIDENTS.find(i => i.id === a.incidentId),
    overdue: a.status !== 'Completed' && daysUntil(a.dueDate) < 0,
    daysLeft: daysUntil(a.dueDate),
  })), []);

  const filtered = useMemo(() => {
    let list = [...enriched].sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (b.status === 'Completed' && a.status !== 'Completed') return -1;
      return a.daysLeft - b.daysLeft;
    });
    if (statusFilter) list = list.filter(a => {
      if (statusFilter === 'Open' && a.overdue) return true;
      return a.status === statusFilter;
    });
    if (search) list = list.filter(a =>
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      a.incidentId.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [enriched, statusFilter, search]);

  const stats = useMemo(() => ({
    total:      MOCK_ACTIONS.length,
    open:       MOCK_ACTIONS.filter(a => a.status === 'Open').length,
    inProgress: MOCK_ACTIONS.filter(a => a.status === 'In Progress').length,
    completed:  MOCK_ACTIONS.filter(a => a.status === 'Completed').length,
    overdue:    enriched.filter(a => a.overdue).length,
  }), [enriched]);

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Incidents
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">build_circle</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">Corrective Actions</h1>
              <p className="text-sm text-[#6b7a99]">Track all corrective actions across incidents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total',       value: stats.total,      bg: 'bg-blue-50 text-blue-600',   icon: 'build_circle' },
            { label: 'Open',        value: stats.open,       bg: 'bg-red-50 text-red-600',     icon: 'radio_button_unchecked' },
            { label: 'In Progress', value: stats.inProgress, bg: 'bg-amber-50 text-amber-600', icon: 'hourglass_top' },
            { label: 'Completed',   value: stats.completed,  bg: 'bg-green-50 text-green-600', icon: 'check_circle' },
            { label: 'Overdue',     value: stats.overdue,    bg: 'bg-red-100 text-red-700',    icon: 'error' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              </div>
              <div>
                <p className={`text-xl font-bold ${s.label === 'Overdue' && s.value > 0 ? 'text-red-600' : 'text-[#0d121b]'}`}>{s.value}</p>
                <p className="text-xs text-[#6b7a99]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {stats.overdue > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">error</span>
            <div>
              <p className="text-sm font-bold text-red-700">{stats.overdue} Overdue Action{stats.overdue > 1 ? 's' : ''}</p>
              <p className="text-xs text-red-600 mt-0.5">
                Overdue corrective actions represent a gap in your ISO 45001 conformance. Escalate to the responsible persons immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search actions, person or incident ID…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as ActionStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[160px]">
            <option value="">All Statuses</option>
            <option value="Open">Open (incl. Overdue)</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
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
                  {['Action ID','Incident','Description','Assigned To','Due Date','Status',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={7} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">build_circle</span>
                      <p className="text-[#6b7a99] font-medium">No corrective actions found</p>
                    </td></tr>
                  )
                  : filtered.map(a => {
                    const sb = statusBadge(a.status, a.overdue);
                    return (
                      <tr key={a.id} className={`hover:bg-[#f6f7fb] transition-colors ${a.overdue ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-4 text-xs font-mono font-bold text-[#6b7a99]">{a.id}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => onSelectIncident(a.incidentId)}
                            className="text-left group">
                            <p className="text-sm font-bold text-[#2e4150] group-hover:underline font-mono">{a.incidentId}</p>
                            {a.incident && (
                              <p className="text-xs text-[#6b7a99] mt-0.5 max-w-[120px] truncate">{a.incident.type}</p>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-[#0d121b] max-w-[240px]">
                          <p className="leading-snug">{a.description}</p>
                          {a.status === 'Completed' && a.completedDate && (
                            <p className="text-xs text-green-600 mt-0.5">Completed {fmt(a.completedDate)}</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {a.assignedTo.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[#0d121b] whitespace-nowrap">{a.assignedTo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className={`text-sm font-medium ${a.overdue ? 'text-red-600' : a.daysLeft <= 7 ? 'text-amber-600' : 'text-[#6b7a99]'}`}>
                            {fmt(a.dueDate)}
                          </p>
                          {a.status !== 'Completed' && (
                            <p className={`text-[10px] mt-0.5 ${a.overdue ? 'text-red-500 font-bold' : a.daysLeft <= 7 ? 'text-amber-500' : 'text-[#6b7a99]'}`}>
                              {a.overdue ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d left`}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                            <span className="material-symbols-outlined text-[13px]">{sb.icon}</span>
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => onSelectIncident(a.incidentId)}
                            className="text-sm font-semibold text-[#2e4150] hover:underline whitespace-nowrap">
                            View Incident
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {MOCK_ACTIONS.length} actions — sorted by urgency
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrectiveActions;
