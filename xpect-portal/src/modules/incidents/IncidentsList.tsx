import React, { useState, useMemo } from 'react';
import { useIncidents } from '../../context/IncidentsContext';
import { IncidentType, Incident } from './types';

interface Props {
  onSelectIncident: (id: string) => void;
  onCreateIncident: () => void;
}

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

const StatCard: React.FC<{ label: string; value: number; icon: string; bg: string }> = ({ label, value, icon, bg }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-5 p-2 flex flex-col items-start gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{label}</p>
      <p className="text-2xl sm:text-[30px] font-bold text-black">{value}</p>
    </div>
  </div>
);

const IncidentsList: React.FC<Props> = ({ onSelectIncident, onCreateIncident }) => {
  const { incidents } = useIncidents();
  const [search, setSearch]       = useState('');
  const [typeFilter, setType]     = useState<IncidentType | ''>('');

  const filtered = useMemo(() => {
    let list = [...incidents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (search) list = list.filter(i =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.worker.toLowerCase().includes(search.toLowerCase()) ||
      i.site.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter) list = list.filter(i => i.type === typeFilter);
    return list;
  }, [search, typeFilter, incidents]);

  const stats = useMemo(() => ({
    total:     incidents.length,
    injuries:  incidents.filter(i => i.injuryOccurred).length,
    accidents: incidents.filter(i => i.type === 'Accident').length,
    nearMiss:  incidents.filter(i => i.type === 'Near Miss').length,
  }), [incidents]);

  const clearFilters = () => { setSearch(''); setType(''); };
  const hasFilters = search || typeFilter;

  const handleCreateClick = () => onCreateIncident();

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full">

      {/* Header */}
      <div className="sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0d121b]">Incident Register</h1>
            <p className="text-base text-[#6b7a99] mt-1">Record and review workplace incidents</p>
          </div>
          <button onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Report Incident
          </button>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6 sm:max-w-full">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[350px] sm:max-w-full">
          <StatCard label="Total Incidents" value={stats.total}     icon="report_problem"         bg="bg-blue-50 text-blue-600" />
          <StatCard label="Accidents"       value={stats.accidents} icon="personal_injury"        bg="bg-red-50 text-red-600" />
          <StatCard label="Near Misses"     value={stats.nearMiss}  icon="warning"                bg="bg-amber-50 text-amber-600" />
          <StatCard label="Injuries"        value={stats.injuries}  icon="medical_services"       bg="bg-rose-50 text-rose-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search by ID, reporter or site…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={typeFilter} onChange={e => setType(e.target.value as IncidentType | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[180px]">
            <option value="">All Types</option>
            {(['Accident','Near Miss','Property Damage','Client Complaint','Environmental Incident'] as IncidentType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
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
                  {['Date','Site','Reported By','Incident Type','Injury',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0
                  ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">report_problem</span>
                      <p className="text-[#6b7a99] font-medium">No incidents found</p>
                      <p className="text-xs text-[#6b7a99] mt-1">Try adjusting your filters, or report a new incident.</p>
                    </td></tr>
                  )
                  : filtered.map(inc => (
                    <tr key={inc.id} onClick={() => onSelectIncident(inc.id)}
                      className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-[#0d121b] font-medium">{fmtDate(inc.date)}</p>
                        <p className="text-xs text-[#6b7a99]">{fmtTime(inc.date)}</p>
                      </td>
                      <td className="px-4 py-4 text-[#0d121b] max-w-[200px] truncate">{inc.site}</td>
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inc.injuryOccurred
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${inc.injuryOccurred ? 'bg-red-500' : 'bg-green-500'}`} />
                          {inc.injuryOccurred ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#2e4150] hover:underline whitespace-nowrap">View Details</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {incidents.length} incidents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentsList;
