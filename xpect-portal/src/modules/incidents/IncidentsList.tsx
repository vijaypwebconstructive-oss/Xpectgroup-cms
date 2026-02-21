import React, { useState, useMemo } from 'react';
import { MOCK_INCIDENTS, MOCK_ACTIONS } from './mockData';
import { Severity, IncidentStatus, IncidentType } from './types';

interface Props {
  onSelectIncident: (id: string) => void;
  onCreateIncident: () => void;
  onNavigateActions: () => void;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const severityBadge = (s: Severity) => ({
  Low:      'bg-green-100 text-green-700 border border-green-200',
  Medium:   'bg-amber-100 text-amber-700 border border-amber-200',
  High:     'bg-red-100 text-red-700 border border-red-200',
  Critical: 'bg-red-200 text-red-800 border border-red-400 font-bold',
}[s]);

const severityDot = (s: Severity) => ({
  Low: 'bg-green-500', Medium: 'bg-amber-500', High: 'bg-red-500', Critical: 'bg-red-700',
}[s]);

const statusBadge = (s: IncidentStatus) => ({
  Open:                 { cls: 'bg-red-100 text-red-700 border border-red-200',       icon: 'radio_button_unchecked' },
  Investigating:        { cls: 'bg-blue-100 text-blue-700 border border-blue-200',    icon: 'manage_search' },
  'Corrective Action':  { cls: 'bg-amber-100 text-amber-700 border border-amber-200', icon: 'build_circle' },
  Closed:               { cls: 'bg-green-100 text-green-700 border border-green-200', icon: 'check_circle' },
}[s]);

const typeBadge = (t: IncidentType) => ({
  'Accident':               'bg-red-50 text-red-700',
  'Near Miss':              'bg-amber-50 text-amber-700',
  'Property Damage':        'bg-orange-50 text-orange-700',
  'Client Complaint':       'bg-purple-50 text-purple-700',
  'Environmental Incident': 'bg-teal-50 text-teal-700',
}[t]);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
    ))}
  </tr>
);

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: string; bg: string; textCls?: string }> = ({ label, value, icon, bg, textCls }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <div>
      <p className={`text-2xl font-bold ${textCls ?? 'text-[#0d121b]'}`}>{value}</p>
      <p className="text-xs text-[#6b7a99] mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const IncidentsList: React.FC<Props> = ({ onSelectIncident, onCreateIncident, onNavigateActions }) => {
  const [search, setSearch]           = useState('');
  const [severityFilter, setSeverity] = useState<Severity | ''>('');
  const [statusFilter, setStatus]     = useState<IncidentStatus | ''>('');
  const [typeFilter, setType]         = useState<IncidentType | ''>('');

  const filtered = useMemo(() => {
    let list = [...MOCK_INCIDENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (search)        list = list.filter(i => i.id.toLowerCase().includes(search.toLowerCase()) || i.worker.toLowerCase().includes(search.toLowerCase()) || i.site.toLowerCase().includes(search.toLowerCase()));
    if (severityFilter) list = list.filter(i => i.severity === severityFilter);
    if (statusFilter)   list = list.filter(i => i.status === statusFilter);
    if (typeFilter)     list = list.filter(i => i.type === typeFilter);
    return list;
  }, [search, severityFilter, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total:       MOCK_INCIDENTS.length,
    open:        MOCK_INCIDENTS.filter(i => i.status === 'Open').length,
    critical:    MOCK_INCIDENTS.filter(i => i.severity === 'Critical' || i.severity === 'High').length,
    overdueActions: MOCK_ACTIONS.filter(a => {
      const d = new Date(a.dueDate); d.setHours(0,0,0,0);
      return a.status !== 'Completed' && d < new Date();
    }).length,
  }), []);

  const clearFilters = () => { setSearch(''); setSeverity(''); setStatus(''); setType(''); };
  const hasFilters = search || severityFilter || statusFilter || typeFilter;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b]">Incidents & Corrective Actions</h1>
            <p className="text-sm text-[#6b7a99] mt-1">ISO 45001 Incident Investigation & Management</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onNavigateActions}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              Corrective Actions
              {stats.overdueActions > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats.overdueActions}
                </span>
              )}
            </button>
            <button onClick={onCreateIncident}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Report Incident
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Incidents"      value={stats.total}          icon="report_problem"   bg="bg-blue-50 text-blue-600" />
          <StatCard label="Open Incidents"       value={stats.open}           icon="radio_button_unchecked" bg="bg-red-50 text-red-600" textCls={stats.open > 0 ? 'text-red-600' : 'text-[#0d121b]'} />
          <StatCard label="High / Critical"      value={stats.critical}       icon="warning"          bg="bg-red-50 text-red-600" />
          <StatCard label="Overdue Actions"      value={stats.overdueActions} icon="event_busy"       bg="bg-amber-50 text-amber-600" textCls={stats.overdueActions > 0 ? 'text-amber-600' : 'text-[#0d121b]'} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search by ID, worker or site…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={typeFilter} onChange={e => setType(e.target.value as IncidentType | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[180px]">
            <option value="">All Types</option>
            {(['Accident','Near Miss','Property Damage','Client Complaint','Environmental Incident'] as IncidentType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={severityFilter} onChange={e => setSeverity(e.target.value as Severity | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[140px]">
            <option value="">All Severities</option>
            {(['Low','Medium','High','Critical'] as Severity[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as IncidentStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[170px]">
            <option value="">All Statuses</option>
            {(['Open','Investigating','Corrective Action','Closed'] as IncidentStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-[#6b7a99] hover:text-[#0d121b] flex items-center gap-1">
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
                  {['Incident ID','Date & Time','Site','Worker','Type','Severity','Status','Investigator',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={9} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">report_problem</span>
                      <p className="text-[#6b7a99] font-medium">No incidents found</p>
                      <p className="text-xs text-[#6b7a99] mt-1">Try adjusting your filters, or report a new incident.</p>
                    </td></tr>
                  )
                  : filtered.map(inc => {
                    const sb = statusBadge(inc.status);
                    return (
                      <tr key={inc.id} onClick={() => onSelectIncident(inc.id)}
                        className={`cursor-pointer hover:bg-[#f6f7fb] transition-colors ${inc.severity === 'Critical' ? 'bg-red-50/40' : ''}`}>
                        <td className="px-4 py-4">
                          <span className="font-bold text-[#2e4150] font-mono">{inc.id}</span>
                          {inc.severity === 'Critical' && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white uppercase tracking-wide">RIDDOR</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-[#0d121b] font-medium">{fmtDate(inc.date)}</p>
                          <p className="text-xs text-[#6b7a99]">{fmtTime(inc.date)}</p>
                        </td>
                        <td className="px-4 py-4 text-[#0d121b] max-w-[160px] truncate">{inc.site}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {inc.worker.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[#0d121b] whitespace-nowrap">{inc.worker}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge(inc.type)}`}>{inc.type}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${severityBadge(inc.severity)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${severityDot(inc.severity)}`} />
                            {inc.severity}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sb.cls}`}>
                            <span className="material-symbols-outlined text-[13px]">{sb.icon}</span>
                            {inc.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#6b7a99]">{inc.investigator ?? '—'}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-[#2e4150] hover:underline whitespace-nowrap">View →</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {MOCK_INCIDENTS.length} incidents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentsList;
