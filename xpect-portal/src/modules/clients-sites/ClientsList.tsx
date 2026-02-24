import React, { useState } from 'react';
import { MOCK_CLIENTS, MOCK_SITES, MOCK_ASSIGNMENTS, contractHealth, daysUntil } from './mockData';

interface ClientsListProps {
  onSelectClient:       (clientId: string) => void;
  onNavigateSites:      () => void;
  onNavigateAllocation: () => void;
}

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
    <div className="space-y-6 max-w-screen sm:w-full sm:max-w-full">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients',  value: totalClients, icon: 'handshake',     iconColor: 'text-[#2e4150]' },
          { label: 'Active Sites',   value: totalSites,   icon: 'location_city', iconColor: 'text-[#2e4150]' },
          { label: 'Expiring Soon',  value: expiringSoon, icon: 'schedule',      iconColor: 'text-amber-500' },
          { label: 'Non-Compliant',  value: nonCompliant, icon: 'warning',       iconColor: 'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm sm:p-4 p-3 flex flex-col gap-3 items-start">
                          <span className={`material-symbols-outlined text-[22px] sm:text-[30px] p-2 w-fit rounded-[12px] sm:p-3 bg-[#f2f6f9] ${s.iconColor}`}>{s.icon}</span>
                          <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{s.label}</p>
                          <p className=" font-bold text-[#000] sm:text-[30px] text-xl">{s.value}</p>
            

            {/* <div className="flex flex-col gap-1 sm:gap-2 justify-between items-left">
           
            </div> */}
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">

        {/* Search + filter bar */}
        <div className="flex items-start gap-3 sm:px-5 px-3 sm:py-4 py-3 border-b border-[#e7ebf3] flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="flex items-center h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 flex-1 min-w-[180px] focus-within:border-[#2e4150]/40 transition-all">
              <span className="material-symbols-outlined text-[#9aa5be] text-[18px] mr-2">search</span>
              <input
                className="bg-transparent border-none text-[#0d121b] placeholder:text-[#9aa5be] text-sm outline-none w-full"
                placeholder="Search company name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              className="h-9 bg-[#f6f6f8] border border-transparent rounded-lg px-3 text-sm text-[#0d121b] outline-none cursor-pointer font-semibold"
            >
              <option value="">All Industries</option>
              {['Office','School','Healthcare','Construction','Retail','Hospitality'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all px-4 h-9 cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Client
          </button>
        </div>

        {/* Table header with record count */}
        <div className="px-5 py-3 border-b border-[#e7ebf3] flex items-center gap-3">
          <h2 className="text-[#0d121b] text-sm sm:text-base font-black font-semibold">Client Records</h2>
          <span className="bg-[#f2f6f9] text-[#4c669a] text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Client Company Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Industry Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Total Sites</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Active Workers</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Contract End</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Compliance Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebf3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                    <p className="text-[#4c669a] text-sm font-semibold">No clients match your search</p>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#0d121b]">{c.name}</p>
                    <p className="text-xs text-[#4c669a] mt-0.5">{c.contactPerson}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#0d121b] font-medium">{c.industry}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.siteCount}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{c.workerCount}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d121b] whitespace-nowrap">
                    {formatDate(c.contractEnd)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-black uppercase tracking-wide ${STATUS_BADGE[c.health]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.health === 'Valid' ? 'bg-green-500' : c.health === 'Expiring' ? 'bg-amber-400' : 'bg-red-500'}`} />
                      {STATUS_LABEL[c.health]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    <button
                      onClick={() => onSelectClient(c.id)}
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
          <p className="text-xs text-[#4c669a]">
            Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{MOCK_CLIENTS.length}</span> clients
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientsList;
