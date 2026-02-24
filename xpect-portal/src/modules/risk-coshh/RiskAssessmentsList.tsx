import React, { useState, useMemo } from 'react';
import { MOCK_RISK_ASSESSMENTS, daysUntil } from './mockData';
import { RiskLevel, ApprovalStatus } from './types';

interface Props {
  onSelectRisk: (id: string) => void;
  onNavigateRAMS: () => void;
  onNavigateCOSHH: () => void;
  onNavigateSDS: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const riskBadge = (level: RiskLevel) => {
  const map: Record<RiskLevel, string> = {
    Low:    'bg-green-100 text-green-700 border border-green-200',
    Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
    High:   'bg-red-100 text-red-700 border border-red-200',
  };
  return map[level];
};

const approvalBadge = (status: ApprovalStatus, nextReview: string) => {
  if (status === 'not_approved') return { cls: 'bg-red-100 text-red-700 border border-red-200',     label: 'Not Approved' };
  if (status === 'pending')      return { cls: 'bg-blue-100 text-blue-700 border border-blue-200',   label: 'Pending' };
  const days = daysUntil(nextReview);
  if (days <= 0)  return { cls: 'bg-red-100 text-red-700 border border-red-200',     label: 'Review Overdue' };
  if (days <= 30) return { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Review Due Soon' };
  return             { cls: 'bg-green-100 text-green-700 border border-green-200',   label: 'Approved' };
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: string; bg: string }> = ({ label, value, icon, bg }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-5 p-2 flex flex-col items-start gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <div>
    <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide">{label}</p>
      <p className="text-2xl sm:text-[30px] font-bold text-[#0d121b]">{value}</p>
      
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <tr className="animate-pulse">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
    ))}
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const RiskAssessmentsList: React.FC<Props> = ({ onSelectRisk, onNavigateRAMS, onNavigateCOSHH, onNavigateSDS }) => {
  const [search, setSearch]       = useState('');
  const [riskFilter, setRisk]     = useState<RiskLevel | ''>('');
  const [statusFilter, setStatus] = useState<ApprovalStatus | ''>('');
  const [loading]                 = useState(false);

  const filtered = useMemo(() => {
    let list = [...MOCK_RISK_ASSESSMENTS];
    if (search)       list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.taskType.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter)   list = list.filter(r => r.riskLevel === riskFilter);
    if (statusFilter) list = list.filter(r => r.approvalStatus === statusFilter);
    return list;
  }, [search, riskFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:    MOCK_RISK_ASSESSMENTS.length,
    approved: MOCK_RISK_ASSESSMENTS.filter(r => r.approvalStatus === 'approved').length,
    overdue:  MOCK_RISK_ASSESSMENTS.filter(r => daysUntil(r.nextReviewDate) <= 0).length,
    high:     MOCK_RISK_ASSESSMENTS.filter(r => r.riskLevel === 'High').length,
  }), []);

  const quickNav = [
    { label: 'RAMS',          icon: 'assignment',      action: onNavigateRAMS  },
    { label: 'COSHH Register',icon: 'science',         action: onNavigateCOSHH },
    { label: 'SDS Library',   icon: 'menu_book',       action: onNavigateSDS   },
  ];

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:max-w-full">

      {/* Header */}
      <div className=" sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between flex-col sm:flex-row gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b]">Risk Assessment & COSHH</h1>
            <p className="text-base text-[#4c669a] mt-1">ISO 45001 Safety Management System</p>
          </div>
          <div className="flex items-left gap-2 flex-col sm:flex-row w-full">
            {quickNav.map(n => (
              <button key={n.label} onClick={n.action}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
                <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                {n.label}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Assessment
            </button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Assessments" value={stats.total}    icon="assignment"       bg="bg-blue-50 text-blue-600" />
          <StatCard label="Approved"           value={stats.approved} icon="verified"         bg="bg-green-50 text-green-600" />
          <StatCard label="High Risk Tasks"    value={stats.high}     icon="warning"          bg="bg-red-50 text-red-600" />
          <StatCard label="Review Overdue"     value={stats.overdue}  icon="event_busy"       bg="bg-amber-50 text-amber-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input type="text" placeholder="Search assessments or task type…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20" />
          </div>
          <select value={riskFilter} onChange={e => setRisk(e.target.value as RiskLevel | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[140px] min-w-full">
            <option value="">All Risk Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={statusFilter} onChange={e => setStatus(e.target.value as ApprovalStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 sm:min-w-[150px] min-w-full">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="not_approved">Not Approved</option>
          </select>
          {(search || riskFilter || statusFilter) && (
            <button onClick={() => { setSearch(''); setRisk(''); setStatus(''); }}
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
                  {['Title', 'Task Type', 'Risk Level', 'Created By', 'Last Review', 'Next Review Due', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {loading
                  ? [...Array(4)].map((_, i) => <Skeleton key={i} />)
                  : filtered.length === 0
                    ? (
                      <tr><td colSpan={8} className="px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
                        <p className="text-[#6b7a99] font-medium">No risk assessments found</p>
                      </td></tr>
                    )
                    : filtered.map(ra => {
                      const ab = approvalBadge(ra.approvalStatus, ra.nextReviewDate);
                      return (
                        <tr key={ra.id} onClick={() => onSelectRisk(ra.id)}
                          className="cursor-pointer hover:bg-[#f6f7fb] transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">assignment</span>
                              <span className="font-semibold text-[#0d121b] max-w-[200px] truncate">{ra.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 min-w-[150px] ">
                            <span className="px-2.5 py-1 rounded-full text-xs min-w-fit display-inline-block font-medium bg-[#f0f2f7] text-[#2e4150]">{ra.taskType}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadge(ra.riskLevel)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ra.riskLevel === 'High' ? 'bg-red-500' : ra.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                              {ra.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {ra.createdBy.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[#0d121b] whitespace-nowrap">{ra.createdBy}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{fmt(ra.lastReviewDate)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${daysUntil(ra.nextReviewDate) <= 0 ? 'text-red-600' : daysUntil(ra.nextReviewDate) <= 30 ? 'text-amber-600' : 'text-[#6b7a99]'}`}>
                              {fmt(ra.nextReviewDate)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ab.cls}`}>{ab.label}</span>
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
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {MOCK_RISK_ASSESSMENTS.length} assessments
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentsList;
