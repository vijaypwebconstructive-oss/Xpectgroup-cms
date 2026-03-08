import React, { useState } from 'react';
import { useProspects } from '../../context/ProspectContext';
import type { ProspectStatus } from './types';
import ProspectForm from './ProspectForm';

const STATUSES: ProspectStatus[] = ['New', 'Contacted', 'Qualified', 'Quotation Sent', 'Converted', 'Lost'];

interface Props {
  prospectId: string;
  onBack: () => void;
}

const statusBadge = (s: ProspectStatus) => ({
  'New':             'bg-slate-100 text-slate-700',
  'Contacted':       'bg-blue-50 text-blue-700',
  'Qualified':       'bg-amber-50 text-amber-700',
  'Quotation Sent':  'bg-purple-50 text-purple-700',
  'Converted':       'bg-green-100 text-green-700',
  'Lost':            'bg-red-50 text-red-700',
}[s] ?? 'bg-gray-50 text-gray-700');

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-[#0d121b]">{value || '—'}</p>
  </div>
);

const ProspectDetailPage: React.FC<Props> = ({ prospectId, onBack }) => {
  const { getProspectById, updateProspect, deleteProspect } = useProspects();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const prospect = getProspectById(prospectId);

  const handleStatusChange = async (newStatus: ProspectStatus) => {
    if (!prospect) return;
    try {
      await updateProspect(prospectId, { status: newStatus });
    } catch {
      // Could show toast
    }
  };

  const handleSave = async (data: Parameters<typeof updateProspect>[1]) => {
    if (!prospect) return;
    try {
      await updateProspect(prospectId, data as Record<string, unknown>);
      setEditing(false);
    } catch {
      // Could show toast
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProspect(prospectId);
      setShowDeleteConfirm(false);
      onBack();
    } finally {
      setDeleting(false);
    }
  };

  if (!prospect) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">person_search</span>
          <p className="text-[#6b7a99]">Prospect not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">
            ← Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Prospect List
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[24px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0d121b]">{prospect.clientName}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(prospect.status)}`}>
                  {prospect.status}
                </span>
                {prospect.company && <span className="text-sm text-[#6b7a99]">{prospect.company}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit
              </button>
            ) : null}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-prospect-detail-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-prospect-detail-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Prospect</h3>
            <p className="text-sm text-[#6b7a99] mb-6">
              Are you sure you want to delete &quot;{prospect.clientName}&quot;? This action cannot be undone.
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
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3">
        {editing ? (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6 max-w-2xl">
            <h3 className="text-base font-bold text-[#0d121b] mb-4">Edit Prospect</h3>
            <ProspectForm
              initial={prospect}
              onSubmit={async data => handleSave(data)}
              onCancel={() => setEditing(false)}
              submitLabel="Save Changes"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Prospect Information */}
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#0d121b] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
                  Prospect Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Client Name" value={prospect.clientName} />
                  <InfoRow label="Company" value={prospect.company} />
                  <InfoRow label="Industry Type" value={prospect.industryType} />
                  <InfoRow label="Email" value={prospect.email} />
                  <InfoRow label="Contact Number" value={prospect.contactNumber} />
                  <InfoRow label="Address" value={prospect.address} />
                </div>
              </div>

              {/* Notes */}
              {prospect.notes && (
                <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
                  <h3 className="text-sm font-bold text-[#0d121b] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">note</span>
                    Notes
                  </h3>
                  <p className="text-sm text-[#0d121b] leading-relaxed whitespace-pre-wrap">{prospect.notes}</p>
                </div>
              )}
            </div>

            {/* Right column - Status Management */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#0d121b] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">swap_horiz</span>
                  Status Management
                </h3>
                <select
                  value={prospect.status}
                  onChange={e => handleStatusChange(e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2.5 bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl text-sm text-[#0d121b] focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-xs text-[#6b7a99] mt-2">
                  Update the prospect status as they move through the pipeline.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectDetailPage;
