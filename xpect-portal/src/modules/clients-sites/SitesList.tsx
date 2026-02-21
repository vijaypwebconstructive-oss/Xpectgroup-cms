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

  const enriched = MOCK_SITES.map(s => {
    const client      = MOCK_CLIENTS.find(c => c.id === s.clientId);
    const assignments = MOCK_ASSIGNMENTS.filter(a => a.siteId === s.id);
    const nonCompliant = assignments.filter(a => a.complianceStatus === 'Non-Compliant').length;
    const expiring     = assignments.filter(a => a.complianceStatus === 'Expiring').length;
    const overallStatus: ComplianceKey =
      nonCompliant > 0 ? 'Non-Compliant' : expiring > 0 ? 'Expiring' : 'Compliant';
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
    <div className="flex-1 flex flex-col bg-white min-h-screen">

      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-0 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[#0d121b] text-2xl font-black">Work Sites</h1>
          <p className="text-[#6b7a99] text-sm mt-1">Location-specific compliance and safety monitoring.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateAllocation}
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-[#e7ebf3] bg-white text-[#0d121b] text-sm font-bold hover:bg-[#f6f7fb] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
            Allocate
          </button>
          <button className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#2e4150] text-white text-sm font-bold hover:bg-[#253545] transition-all cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add_location</span>
            Add Site
          </button>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="mx-8 mt-6 mb-8 rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden bg-white">

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e7ebf3] flex-wrap">
          <label className="flex items-center flex-1 min-w-[180px] h-9 bg-[#f6f7fb] rounded-lg px-3 border border-[#e7ebf3] focus-within:border-[#2e4150]/40 transition-all">
            <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
            <input
              className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
              placeholder="Search site name or postcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
          <div className="relative">
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="h-9 appearance-none bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg pl-3 pr-8 text-sm text-[#0d121b] outline-none cursor-pointer font-medium"
            >
              <option value="">All Clients</option>
              {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="material-symbols-outlined text-[#9aa5be] text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
          <div className="relative">
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="h-9 appearance-none bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg pl-3 pr-8 text-sm text-[#0d121b] outline-none cursor-pointer font-medium"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <span className="material-symbols-outlined text-[#9aa5be] text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Site Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Postcode</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Risk Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Required Trainings</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Assigned Workers</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Compliance Status</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[#d1d5db] text-5xl block mb-2">search_off</span>
                    <p className="text-[#6b7a99] text-sm font-semibold">No sites match your filters</p>
                  </td>
                </tr>
              ) : filtered.map(site => (
                <tr key={site.id} className="hover:bg-[#fafbfc] transition-colors">
                  {/* Site Name */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{site.name}</p>
                  </td>
                  {/* Client */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[#0d121b]">{site.client?.name ?? '—'}</p>
                  </td>
                  {/* Postcode */}
                  <td className="px-4 py-4 text-sm font-medium text-[#6b7a99]">{site.postcode}</td>
                  {/* Risk Level */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${RISK_BADGE[site.riskLevel]}`}>
                      {site.riskLevel}
                    </span>
                  </td>
                  {/* Required Trainings */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {site.requiredTrainings.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-[#f0f2f7] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                          {t.length > 12 ? t.slice(0, 10) + '…' : t}
                        </span>
                      ))}
                      {site.requiredTrainings.length > 2 && (
                        <span className="text-xs bg-[#f0f2f7] text-[#4c669a] border border-[#e7ebf3] px-2 py-0.5 rounded font-bold">
                          +{site.requiredTrainings.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Workers */}
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{site.assignmentCount}</td>
                  {/* Compliance */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${COMPLIANCE_BADGE[site.overallStatus]}`}>
                      {site.overallStatus === 'Non-Compliant' ? 'Non-Compliant' : site.overallStatus}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="text-[#2e4150] text-xs font-bold hover:text-[#2e4150]/70 transition-colors uppercase tracking-wide cursor-pointer"
                    >
                      View Site
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-[#e7ebf3] bg-[#f8fafc]">
          <p className="text-xs text-[#6b7a99] text-center">
            © 2024 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SitesList;
