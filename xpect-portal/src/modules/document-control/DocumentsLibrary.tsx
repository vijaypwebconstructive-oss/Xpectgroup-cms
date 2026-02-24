import React, { useState, useMemo } from 'react';
import { MOCK_DOCUMENTS, daysUntilDate } from './mockData';
import { PolicyDocument, DocCategory, DocStatus } from './types';

interface Props {
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onNavigateApprovals: () => void;
  onNavigateReviews: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES: DocCategory[] = [
  'Health & Safety',
  'Environmental',
  'Quality',
  'Work Instructions',
  'Forms',
  'Insurance',
];

const statusBadge = (doc: PolicyDocument): { label: string; cls: string } => {
  if (doc.status === 'draft')    return { label: 'Draft',    cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  if (doc.status === 'rejected') return { label: 'Rejected', cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (doc.status === 'pending')  return { label: 'Pending',  cls: 'bg-blue-100 text-blue-700 border border-blue-200' };
  if (doc.status === 'expired')  return { label: 'Expired',  cls: 'bg-red-100 text-red-700 border border-red-200' };
  // approved — check review date
  const days = daysUntilDate(doc.nextReviewDate);
  if (days <= 0)  return { label: 'Overdue',     cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (days <= 30) return { label: 'Review Soon', cls: 'bg-amber-100 text-amber-700 border border-amber-200' };
  return { label: 'Approved', cls: 'bg-green-100 text-green-700 border border-green-200' };
};

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Stat cards ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number; icon: string; iconBg: string }> = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-3 p-2 flex items-start gap-3 flex-col">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </div>
    <p className="text-xs font-bold text-[#4c669a] uppercase tracking-wide mt-0.5">{label}</p>
    <p className="text-xl sm:text-[30px] font-bold text-[#0d121b]">{value}</p>
     
    
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <tr className="animate-pulse">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// ── Main component ────────────────────────────────────────────────────────────

const DocumentsLibrary: React.FC<Props> = ({ onSelectDoc, onCreateDoc, onNavigateApprovals, onNavigateReviews }) => {
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState<DocCategory | ''>('');
  const [statusFilter, setStatus]   = useState<DocStatus | ''>('');
  const [loading]                   = useState(false);

  const docs = useMemo(() => {
    let list = [...MOCK_DOCUMENTS];
    if (search)       list = list.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()));
    if (category)     list = list.filter(d => d.category === category);
    if (statusFilter) list = list.filter(d => d.status === statusFilter);
    return list;
  }, [search, category, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total:    MOCK_DOCUMENTS.length,
    approved: MOCK_DOCUMENTS.filter(d => d.status === 'approved').length,
    pending:  MOCK_DOCUMENTS.filter(d => d.status === 'pending').length,
    overdue:  MOCK_DOCUMENTS.filter(d => {
      if (d.status !== 'approved') return false;
      return daysUntilDate(d.nextReviewDate) <= 30;
    }).length,
  }), []);

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#0d121b]">Document Control</h1>
            <p className="text-base text-[#4c669a] mt-1">ISO 9001 Policy & Document Management</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onNavigateReviews}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              Review Calendar
            </button>
            <button
              onClick={onNavigateApprovals}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              Approvals
              {stats.pending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={onCreateDoc}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Document
            </button>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Documents"   value={stats.total}    icon="folder_managed" iconBg="bg-blue-50 text-blue-600" />
          <StatCard label="Approved"          value={stats.approved} icon="verified"        iconBg="bg-green-50 text-green-600" />
          <StatCard label="Pending Approval"  value={stats.pending}  icon="pending_actions" iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="Review Overdue"    value={stats.overdue}  icon="warning"         iconBg="bg-red-50 text-red-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input
              type="text"
              placeholder="Search documents or owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as DocCategory | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[160px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value as DocStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-full sm:min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          {(search || category || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setStatus(''); }}
              className="text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                  {['Document Title', 'Category', 'Version', 'Owner', 'Approval Status', 'Last Review', 'Next Review Due', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {loading
                  ? [...Array(5)].map((_, i) => <Skeleton key={i} />)
                  : docs.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center">
                          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">folder_open</span>
                          <p className="text-[#6b7a99] font-medium">No documents found</p>
                          <p className="text-xs text-[#6b7a99] mt-1">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )
                    : docs.map(doc => {
                      const badge = statusBadge(doc);
                      return (
                        <tr
                          key={doc.id}
                          onClick={() => onSelectDoc(doc.id)}
                          className="cursor-pointer hover:bg-[#f6f7fb] transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">description</span>
                              <span className="font-semibold text-[#0d121b] max-w-[220px] truncate">{doc.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 min-w-[150px] ">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#0d121b] font-mono font-medium">v{doc.version}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {doc.owner.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[#0d121b]">{doc.owner}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#6b7a99] whitespace-nowrap">{formatDate(doc.lastReviewDate)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {doc.nextReviewDate ? (
                              <span className={`text-sm font-medium ${
                                daysUntilDate(doc.nextReviewDate) <= 0   ? 'text-red-600' :
                                daysUntilDate(doc.nextReviewDate) <= 30  ? 'text-amber-600' :
                                'text-[#6b7a99]'
                              }`}>
                                {formatDate(doc.nextReviewDate)}
                              </span>
                            ) : (
                              <span className="text-[#6b7a99]">—</span>
                            )}
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
          {docs.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {docs.length} of {MOCK_DOCUMENTS.length} documents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsLibrary;
