import React, { useState, useMemo } from 'react';
import { useProspects } from '../../context/ProspectContext';
import type { Prospect, ProspectStatus } from './types';

interface Props {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}

const statusBadge = (s: ProspectStatus) => ({
  'New':             'bg-slate-100 text-slate-700',
  'Contacted':       'bg-blue-50 text-blue-700',
  'Qualified':       'bg-amber-50 text-amber-700',
  'Quotation Sent':  'bg-purple-50 text-purple-700',
  'Converted':       'bg-green-100 text-green-700',
  'Lost':            'bg-red-50 text-red-700',
}[s] ?? 'bg-gray-50 text-gray-700');

const ProspectListPage: React.FC<Props> = ({ onView, onEdit, onAdd }) => {
  const { prospects, loading, error, deleteProspect } = useProspects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | ''>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...prospects].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.clientName.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.industryType.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    return list;
  }, [prospects, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProspect(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || statusFilter;
  const clearFilters = () => { setSearch(''); setStatusFilter(''); };

  if (loading) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#6b7a99]">
          <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
          <span>Loading prospects…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f7fb] w-screen sm:w-full">
      {/* Header */}
      <div className="sm:px-8 px-4 sm:py-6 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0d121b]">Prospect List</h1>
            <p className="text-base text-[#6b7a99] mt-1">Manage potential clients before conversion</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Prospect
          </button>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-4 flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6b7a99]">search</span>
            <input
              type="text"
              placeholder="Search by name, company, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] placeholder:text-[#6b7a99] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProspectStatus | '')}
            className="px-3 py-2 bg-[#f6f7fb] border border-[#e7ebf3] rounded-lg text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 min-w-[180px]"
          >
            <option value="">All Statuses</option>
            {(['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'] as ProspectStatus[]).map(s => (
              <option key={s} value={s}>{s}</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Client Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Industry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">person_search</span>
                      <p className="text-[#6b7a99] font-medium">No prospects found</p>
                      <p className="text-xs text-[#6b7a99] mt-1">Try adjusting your filters, or add a new prospect.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-4 py-4 text-[#6b7a99] font-medium">{idx + 1}</td>
                      <td className="px-4 py-4 text-[#0d121b] font-medium">{p.clientName}</td>
                      <td className="px-4 py-4 text-[#0d121b] max-w-[180px] truncate">{p.company || '—'}</td>
                      <td className="px-4 py-4 text-[#0d121b] max-w-[140px] truncate">{p.industryType || '—'}</td>
                      <td className="px-4 py-4 text-[#0d121b] max-w-[180px] truncate">{p.email || '—'}</td>
                      <td className="px-4 py-4 text-[#0d121b] whitespace-nowrap">{p.contactNumber || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onView(p.id)}
                            className="p-2 rounded-lg text-[#2e4150] hover:bg-[#2e4150]/10 transition-colors"
                            title="View"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => onEdit(p.id)}
                            className="p-2 rounded-lg text-[#2e4150] hover:bg-[#2e4150]/10 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e7ebf3] bg-[#f6f7fb] text-xs text-[#6b7a99]">
              Showing {filtered.length} of {prospects.length} prospects
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !deleting && setDeleteId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-prospect-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-prospect-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Prospect</h3>
            <p className="text-sm text-[#6b7a99] mb-6">
              Are you sure you want to delete this prospect? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectListPage;
