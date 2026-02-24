import React, { useState } from 'react';
import { MOCK_SITES, MOCK_CLIENTS, MOCK_ASSIGNMENTS } from './mockData';

interface SitesListProps {
  onSelectSite:         (siteId: string) => void;
  onNavigateAllocation: () => void;
}

const RISK_BADGE = {
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
};

const COMPLIANCE_BADGE = {
  Compliant:       'bg-green-100 text-green-700 border border-green-200',
  Expiring:        'bg-amber-100 text-amber-700 border border-amber-200',
  'Non-Compliant': 'bg-red-100 text-red-700 border border-red-200',
};

type ComplianceKey = 'Compliant' | 'Expiring' | 'Non-Compliant';

const SitesList: React.FC<SitesListProps> = ({ onSelectSite, onNavigateAllocation }) => {
  const [search, setSearch]             = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [riskFilter, setRiskFilter]     = useState('');

  const totalSites    = MOCK_SITES.length;
  const highRisk      = MOCK_SITES.filter(s => s.riskLevel === 'High').length;
  const nonCompliant  = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant').length;
  const totalWorkers  = MOCK_ASSIGNMENTS.length;

  const enriched = MOCK_SITES.map(s => {
    const client      = MOCK_CLIENTS.find(c => c.id === s.clientId);
    const assignments = MOCK_ASSIGNMENTS.filter(a => a.siteId === s.id);
    const nonC = assignments.filter(a => a.complianceStatus === 'Non-Compliant').length;
    const exp  = assignments.filter(a => a.complianceStatus === 'Expiring').length;
    const overallStatus: ComplianceKey =
      nonC > 0 ? 'Non-Compliant' : exp > 0 ? 'Expiring' : 'Compliant';
    return { ...s, client, assignmentCount: assignments.length, overallStatus };
  });

  const filtered = enriched.filter(s => {
    const q = search.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || s.postcode.toLowerCase().includes(q)) &&
      (!clientFilter || s.clientId === clientFilter) &&
      (!riskFilter   || s.riskLevel === riskFilter)
    );
  });

  return (
    <div className="space-y-6 max-w-screen sm:w-full sm:max-w-full">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sites',    value: totalSites,   icon: 'location_city', iconColor: 'text-[#2e4150]' },
          { label: 'Total Workers',  value: totalWorkers, icon: 'group',         iconColor: 'text-[#2e4150]' },
          { label: 'High Risk',      value: highRisk,     icon: 'warning',       iconColor: 'text-amber-500' },
          { label: 'Non-Compliant',  value: nonCompliant, icon: 'person_off',    iconColor: 'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1 sm:gap-3 justify-between items-left">
              <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${s.iconColor}`}>{s.icon}</span>
              <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
              <p className="text-[30px] font-bold text-[#000]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[180px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search site name or postcode..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Clients</option>
              {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold sm:min-w-[160px] min-w-full"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateAllocation}
              className="flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white text-[#0d121b] text-xs font-bold hover:bg-[#f6f6f8] transition-all px-4 h-9 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
              Allocate
            </button>
            <button className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Site
            </button>
          </div>
        </div>

        {/* Table header with record count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-black font-semibold">Site Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Site Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Postcode</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Risk Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Required Trainings</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Workers</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Compliance</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No sites match your filters</p>
                  </td>
                </tr>
              ) : filtered.map(site => (
                <tr key={site.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{site.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[#0d121b]">{site.client?.name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[#4c669a] whitespace-nowrap">{site.postcode}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase font-semibold tracking-wide ${RISK_BADGE[site.riskLevel]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${site.riskLevel === 'Low' ? 'bg-green-500' : site.riskLevel === 'Medium' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {site.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {site.requiredTrainings.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-semibold">
                          {t.length > 12 ? t.slice(0, 10) + '…' : t}
                        </span>
                      ))}
                      {site.requiredTrainings.length > 2 && (
                        <span className="text-xs bg-[#f2f6f9] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-bold">
                          +{site.requiredTrainings.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{site.assignmentCount}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${COMPLIANCE_BADGE[site.overallStatus]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${site.overallStatus === 'Compliant' ? 'bg-green-500' : site.overallStatus === 'Expiring' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {site.overallStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="text-[#4c669a] text-xs font-black capitalize tracking-wide transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{MOCK_SITES.length}</span> sites
          </p>
        </div>
      </div>
    </div>
  );
};

export default SitesList;
