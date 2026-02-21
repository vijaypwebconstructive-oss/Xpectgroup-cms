import React, { useState } from 'react';
import { AppView, Cleaner, VerificationStatus, DBSStatus } from '../types';
import { useCleaners } from '../context/CleanersContext';

interface EmployeeComplianceProps {
  onNavigate: (view: AppView, cleaner?: Cleaner) => void;
}

type FilterTab = 'ALL' | 'VERIFIED' | 'PENDING' | 'DOCS_REQUIRED' | 'REJECTED';

// ── Mock compliance employees ────────────────────────────────
interface ComplianceEmployee {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  location: string;
  verificationStatus: VerificationStatus;
  dbsStatus: DBSStatus;
  lastChecked: string;
  dbsExpiry?: string;
  nationality: string;
  employmentType: string;
  isMock: true;
}

const MOCK_EMPLOYEES: ComplianceEmployee[] = [
  {
    id: 'mock-001',
    name: 'James Thornton',
    initials: 'JT',
    avatarColor: 'bg-blue-500',
    role: 'Senior Cleaner',
    location: 'Manchester North',
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.CLEARED,
    lastChecked: '2025-11-15',
    dbsExpiry: '2026-11-15',
    nationality: 'British',
    employmentType: 'Permanent',
    isMock: true,
  },
  {
    id: 'mock-002',
    name: 'Sarah Mitchell',
    initials: 'SM',
    avatarColor: 'bg-pink-500',
    role: 'Cleaner',
    location: 'Manchester South',
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.CLEARED,
    lastChecked: '2025-10-22',
    dbsExpiry: '2026-10-22',
    nationality: 'British',
    employmentType: 'Permanent',
    isMock: true,
  },
  {
    id: 'mock-003',
    name: 'David Okafor',
    initials: 'DO',
    avatarColor: 'bg-emerald-500',
    role: 'Cleaner',
    location: 'Liverpool Central',
    verificationStatus: VerificationStatus.PENDING,
    dbsStatus: DBSStatus.AWAITING_DOCS,
    lastChecked: '2026-01-08',
    nationality: 'Nigerian',
    employmentType: 'Contractor',
    isMock: true,
  },
  {
    id: 'mock-004',
    name: 'Emma Clarke',
    initials: 'EC',
    avatarColor: 'bg-violet-500',
    role: 'Supervisor',
    location: 'Leeds West',
    verificationStatus: VerificationStatus.DOCS_REQUIRED,
    dbsStatus: DBSStatus.CLEARED,
    lastChecked: '2025-12-03',
    dbsExpiry: '2026-12-03',
    nationality: 'British',
    employmentType: 'Permanent',
    isMock: true,
  },
  {
    id: 'mock-005',
    name: 'Ryan Patel',
    initials: 'RP',
    avatarColor: 'bg-orange-500',
    role: 'Cleaner',
    location: 'Bristol East',
    verificationStatus: VerificationStatus.VERIFIED,
    dbsStatus: DBSStatus.EXPIRED,
    lastChecked: '2024-09-18',
    dbsExpiry: '2025-09-18',
    nationality: 'British',
    employmentType: 'Temporary',
    isMock: true,
  },
  {
    id: 'mock-006',
    name: 'Priya Singh',
    initials: 'PS',
    avatarColor: 'bg-rose-500',
    role: 'Cleaner',
    location: 'Manchester South',
    verificationStatus: VerificationStatus.REJECTED,
    dbsStatus: DBSStatus.NOT_STARTED,
    lastChecked: '2026-02-01',
    nationality: 'Indian',
    employmentType: 'Contractor',
    isMock: true,
  },
];

// ── Style maps ───────────────────────────────────────────────
const RTW_STATUS_STYLES: Record<string, { dot: string; label: string; badge: string }> = {
  [VerificationStatus.VERIFIED]:      { dot: 'bg-green-500',  label: 'Verified',       badge: 'bg-green-100 text-green-700' },
  [VerificationStatus.PENDING]:       { dot: 'bg-amber-400',  label: 'Pending',        badge: 'bg-amber-100 text-amber-700' },
  [VerificationStatus.DOCS_REQUIRED]: { dot: 'bg-blue-500',   label: 'Docs Required',  badge: 'bg-blue-100 text-blue-700' },
  [VerificationStatus.REJECTED]:      { dot: 'bg-red-500',    label: 'Rejected',       badge: 'bg-red-100 text-red-700' },
};

const DBS_STATUS_STYLES: Record<string, { icon: string; label: string; color: string }> = {
  [DBSStatus.CLEARED]:       { icon: 'verified',                  label: 'Cleared',       color: 'text-green-600' },
  [DBSStatus.AWAITING_DOCS]: { icon: 'pending',                   label: 'Awaiting Docs', color: 'text-amber-500' },
  [DBSStatus.NOT_STARTED]:   { icon: 'radio_button_unchecked',    label: 'Not Started',   color: 'text-gray-400' },
  [DBSStatus.EXPIRED]:       { icon: 'cancel',                    label: 'Expired',       color: 'text-red-500' },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',           label: 'All' },
  { key: 'VERIFIED',      label: 'Verified' },
  { key: 'PENDING',       label: 'Pending' },
  { key: 'DOCS_REQUIRED', label: 'Docs Required' },
  { key: 'REJECTED',      label: 'Rejected' },
];

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

// ── Main component ───────────────────────────────────────────
const EmployeeCompliance: React.FC<EmployeeComplianceProps> = ({ onNavigate }) => {
  const { cleaners } = useCleaners();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  // Combine real cleaners with mock employees (mock shows when no real data)
  type Row = ComplianceEmployee | (Cleaner & { isMock?: false });
  const rows: Row[] = cleaners.length > 0
    ? (cleaners as Row[])
    : (MOCK_EMPLOYEES as Row[]);

  const getStatus = (r: Row): VerificationStatus =>
    'isMock' in r && r.isMock
      ? (r as ComplianceEmployee).verificationStatus
      : (r as Cleaner).verificationStatus as VerificationStatus;

  const getDbsStatus = (r: Row): DBSStatus =>
    'isMock' in r && r.isMock
      ? (r as ComplianceEmployee).dbsStatus
      : (r as Cleaner).dbsStatus as DBSStatus;

  // Stats
  const total       = rows.length || 1;
  const verified    = rows.filter(r => getStatus(r) === VerificationStatus.VERIFIED).length;
  const pending     = rows.filter(r => getStatus(r) === VerificationStatus.PENDING).length;
  const docsReq     = rows.filter(r => getStatus(r) === VerificationStatus.DOCS_REQUIRED).length;
  const dbsExpired  = rows.filter(r => getDbsStatus(r) === DBSStatus.EXPIRED).length;

  // Filter
  const filtered = rows.filter(r => {
    if (activeFilter === 'ALL')           return true;
    if (activeFilter === 'VERIFIED')      return getStatus(r) === VerificationStatus.VERIFIED;
    if (activeFilter === 'PENDING')       return getStatus(r) === VerificationStatus.PENDING;
    if (activeFilter === 'DOCS_REQUIRED') return getStatus(r) === VerificationStatus.DOCS_REQUIRED;
    if (activeFilter === 'REJECTED')      return getStatus(r) === VerificationStatus.REJECTED;
    return true;
  });

  const statCards = [
    { label: 'Fully Verified',  count: verified,   barColor: 'bg-green-500', pct: Math.round((verified  / total) * 100), icon: 'verified_user',  iconColor: 'text-green-500' },
    { label: 'Pending Review',  count: pending,    barColor: 'bg-amber-400', pct: Math.round((pending   / total) * 100), icon: 'schedule',       iconColor: 'text-amber-400' },
    { label: 'Docs Required',   count: docsReq,    barColor: 'bg-blue-500',  pct: Math.round((docsReq   / total) * 100), icon: 'description',    iconColor: 'text-blue-500' },
    { label: 'DBS Expired',     count: dbsExpired, barColor: 'bg-red-400',   pct: Math.round((dbsExpired/ total) * 100), icon: 'gpp_bad',        iconColor: 'text-red-500' },
  ];

  return (
    <div className="flex-1 flex flex-col w-full py-[15px] sm:py-8 px-4 sm:px-6 md:px-10 animate-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-160px)]">
      <div className="w-full space-y-6">

        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d121b] text-[1.6rem] sm:text-2xl font-black">Employee Compliance</h1>
            <p className="text-[#4c669a] text-base">Monitor right-to-work, DBS status, and document verification across your workforce.</p>
          </div>
          <button
            onClick={() => onNavigate('STAFF_INVITES')}
            className="flex items-center justify-center gap-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all px-[30px] py-[15px] h-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>New Compliance Check</span>
          </button>
        </div>

        {/* Alert banner — DBS expired */}
        {dbsExpired > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[22px]">gpp_bad</span>
            <div className="flex-1">
              <p className="text-red-800 text-sm font-bold">{dbsExpired} employee{dbsExpired > 1 ? 's have' : ' has'} an expired DBS certificate</p>
              <p className="text-red-600 text-xs">Renewal required to remain compliant with employment law.</p>
            </div>
          </div>
        )}

        {/* Docs-required alert */}
        {docsReq > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-blue-500 text-[22px]">description</span>
            <p className="text-blue-800 text-sm font-bold">{docsReq} employee{docsReq > 1 ? 's are' : ' is'} awaiting required documents — action needed.</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{card.label}</p>
                <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`}>{card.icon}</span>
              </div>
              <p className="text-4xl font-black text-[#0d121b]">{card.count}</p>
              <p className="text-[11px] text-[#4c669a] uppercase tracking-wide">{card.pct}% of workforce</p>
              <div className="h-1.5 rounded-full bg-[#e7ebf3] overflow-hidden">
                <div className={`h-full rounded-full ${card.barColor} transition-all duration-500`} style={{ width: `${card.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Compliance table */}
        <div className="bg-white rounded-2xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e7ebf3]">
            <div className="flex items-center gap-3">
              <h2 className="text-[#0d121b] text-base font-black">Compliance Status List</h2>
              <span className="text-xs font-bold bg-[#e7ebf3] text-[#4c669a] px-2.5 py-1 rounded-full">{filtered.length} employees</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === tab.key
                      ? 'bg-[#2e4150] text-white'
                      : 'text-[#4c669a] hover:bg-[#e7ebf3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Role / Location</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">RTW Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">DBS Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Last Checked</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-[#4c669a] uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <span className="material-symbols-outlined text-[#c7c7c7] text-5xl block mb-2">search_off</span>
                      <p className="text-[#4c669a] text-sm font-semibold">No employees match this filter</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(row => {
                    const isMock = 'isMock' in row && row.isMock;
                    const mock = isMock ? (row as ComplianceEmployee) : null;
                    const real = !isMock ? (row as Cleaner) : null;

                    const name      = mock ? mock.name      : real!.name;
                    const initials  = mock ? mock.initials  : (real!.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase());
                    const avatarClr = mock ? mock.avatarColor : 'bg-[#2e4150]';
                    const avatar    = real?.avatar;
                    const role      = mock ? mock.role      : (real!.employmentType || 'Cleaner');
                    const location  = mock ? mock.location  : (real!.location || '—');
                    const nationality = mock ? mock.nationality : (real!.citizenshipStatus || '—');
                    const lastChecked = mock ? mock.lastChecked : (real!.startDate || '');
                    const dbsExpiry   = mock?.dbsExpiry;

                    const rtw = RTW_STATUS_STYLES[getStatus(row)] ?? { dot: 'bg-gray-400', label: getStatus(row), badge: 'bg-gray-100 text-gray-600' };
                    const dbs = DBS_STATUS_STYLES[getDbsStatus(row)] ?? { icon: 'help', label: getDbsStatus(row), color: 'text-gray-400' };
                    const isDbsExpired = getDbsStatus(row) === DBSStatus.EXPIRED;

                    return (
                      <tr key={isMock ? mock!.id : real!.id} className="hover:bg-[#f8fafc] transition-colors group">
                        {/* Employee */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full ${avatarClr} shrink-0 flex items-center justify-center`}>
                                <span className="text-white text-xs font-black">{initials}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-[#0d121b]">{name}</p>
                              <p className="text-xs text-[#4c669a]">{nationality}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role / Location */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-[#0d121b]">{role}</p>
                          <p className="text-xs text-[#4c669a]">{location}</p>
                        </td>

                        {/* RTW Status */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${rtw.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rtw.dot}`} />
                            {rtw.label}
                          </span>
                        </td>

                        {/* DBS Status */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className={`flex items-center gap-1.5 text-sm font-semibold ${dbs.color}`}>
                              <span className="material-symbols-outlined text-[18px]">{dbs.icon}</span>
                              {dbs.label}
                            </span>
                            {dbsExpiry && !isDbsExpired && (
                              <span className="text-xs text-[#4c669a]">Expires {formatDate(dbsExpiry)}</span>
                            )}
                            {isDbsExpired && dbsExpiry && (
                              <span className="text-xs text-red-500 font-semibold">Expired {formatDate(dbsExpiry)}</span>
                            )}
                          </div>
                        </td>

                        {/* Last Checked */}
                        <td className="px-4 py-4 text-sm text-[#4c669a] font-medium">
                          {lastChecked ? formatDate(lastChecked) : '—'}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => real && onNavigate('CLEANER_DETAIL', real)}
                            className={`text-xs font-black uppercase tracking-wide transition-colors cursor-pointer ${
                              real
                                ? 'text-[#2e4150] hover:text-[#4c669a] opacity-0 group-hover:opacity-100'
                                : 'text-[#c7c7c7] cursor-default'
                            }`}
                          >
                            {real ? 'View Audit' : 'Demo'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#e7ebf3] bg-[#f8fafc] flex items-center justify-between">
            <p className="text-xs text-[#4c669a]">
              Showing <span className="font-bold text-[#0d121b]">{filtered.length}</span> of <span className="font-bold text-[#0d121b]">{rows.length}</span> employees
            </p>
            <p className="text-xs text-[#4c669a]">
              Compliance rate: <span className="font-bold text-green-600">{Math.round((verified / total) * 100)}%</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeCompliance;
