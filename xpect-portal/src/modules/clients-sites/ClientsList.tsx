import React, { useState } from 'react';
import { MOCK_CLIENTS, MOCK_SITES, MOCK_ASSIGNMENTS, contractHealth, daysUntil } from './mockData';

interface ClientsListProps {
  onSelectClient:       (clientId: string) => void;
  onNavigateSites:      () => void;
  onNavigateAllocation: () => void;
}

// Project color palette badges
const STATUS_BADGE = {
  Valid:    'bg-green-100 text-green-700 border border-green-200',
  Expiring: 'bg-amber-100 text-amber-700 border border-amber-200',
  Expired:  'bg-red-100 text-red-700 border border-red-200',
};
const STATUS_LABEL = { Valid: 'Active', Expiring: 'Expiring Soon', Expired: 'Expired' };

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

const ClientsList: React.FC<ClientsListProps> = ({ onSelectClient }) => {
  const [search, setSearch]             = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const enriched = MOCK_CLIENTS.map(c => ({
    ...c,
    health:      contractHealth(c),
    siteCount:   MOCK_SITES.filter(s => s.clientId === c.id).length,
    workerCount: MOCK_ASSIGNMENTS.filter(a => a.clientId === c.id).length,
    daysLeft:    Math.min(daysUntil(c.contractEnd), daysUntil(c.insuranceExpiry)),
  }));

  const filtered = enriched.filter(c => {
    const q = search.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q)) &&
      (!industryFilter || c.industry === industryFilter)
    );
  });

  const totalClients  = MOCK_CLIENTS.length;
  const totalSites    = MOCK_SITES.length;
  const expiringSoon  = enriched.filter(c => c.health === 'Expiring').length;
  const nonCompliant  = MOCK_ASSIGNMENTS.filter(a => a.complianceStatus === 'Non-Compliant').length;

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">

      {/* ── Page header ── */}
      <div className="px-8 pt-8 pb-0 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[#0d121b] text-2xl font-black">Clients &amp; Sites</h1>
          <p className="text-[#6b7a99] text-sm mt-1">Enterprise workforce compliance management.</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#2e4150] text-white text-sm font-bold hover:bg-[#253545] transition-all cursor-pointer shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Client
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-8 pt-6">
        {[
          { label: 'Total Clients',  value: totalClients, color: 'text-[#0d121b]' },
          { label: 'Active Sites',   value: totalSites,   color: 'text-[#0d121b]' },
          { label: 'Expiring Soon',  value: expiringSoon, color: 'text-amber-500' },
          { label: 'Non-Compliant',  value: nonCompliant, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
            <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">{s.label}</p>
            <p className={`text-4xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="mx-8 mt-6 mb-8 rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden bg-white">

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e7ebf3]">
          <label className="flex items-center flex-1 h-9 bg-[#f6f7fb] rounded-lg px-3 border border-[#e7ebf3] focus-within:border-[#2e4150]/40 transition-all">
            <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
            <input
              className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
              placeholder="Search company name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
          <div className="relative shrink-0">
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              className="h-9 appearance-none bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg pl-3 pr-8 text-sm text-[#0d121b] outline-none cursor-pointer font-medium"
            >
              <option value="">All Industries</option>
              {['Office','School','Healthcare','Construction','Retail','Hospitality'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[#9aa5be] text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                {['Client Company Name','Industry Type','Total Sites','Active Workers','Contract End','Compliance Status','Actions'].map((h, i) => (
                  <th key={h} className={`py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider ${i === 0 ? 'text-left px-6' : i === 6 ? 'text-right px-6' : 'text-left px-4'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[#d1d5db] text-5xl block mb-2">search_off</span>
                    <p className="text-[#6b7a99] text-sm font-semibold">No clients match your search</p>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#fafbfc] transition-colors">
                  {/* Client Name */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{c.name}</p>
                    <p className="text-xs text-[#6b7a99] mt-0.5">{c.contactPerson}</p>
                  </td>
                  {/* Industry */}
                  <td className="px-4 py-4 text-sm text-[#0d121b] font-medium">{c.industry}</td>
                  {/* Sites */}
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.siteCount}</td>
                  {/* Workers */}
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.workerCount}</td>
                  {/* Contract end */}
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">
                    {formatDate(c.contractEnd)}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${STATUS_BADGE[c.health]}`}>
                      {STATUS_LABEL[c.health]}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectClient(c.id)}
                      className="text-[#2e4150] text-xs font-bold hover:text-[#2e4150]/70 transition-colors uppercase tracking-wide cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#e7ebf3] bg-[#f8fafc]">
          <p className="text-xs text-[#6b7a99] text-center">
            © 2024 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientsList;
