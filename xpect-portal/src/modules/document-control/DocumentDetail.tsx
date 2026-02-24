import React, { useState, useCallback } from 'react';
import { getDocById, daysUntilDate, updateDocStatus, MOCK_DOCUMENTS } from './mockData';
import { PolicyDocument } from './types';

interface Props {
  docId: string;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusStyle = (status: PolicyDocument['status']) => {
  const map: Record<PolicyDocument['status'], string> = {
    approved:  'bg-green-100 text-green-700 border border-green-200',
    pending:   'bg-blue-100 text-blue-700 border border-blue-200',
    draft:     'bg-gray-100 text-gray-600 border border-gray-200',
    rejected:  'bg-red-100 text-red-700 border border-red-200',
    expired:   'bg-red-100 text-red-700 border border-red-200',
  };
  return map[status] ?? map.draft;
};

const statusLabel = (status: PolicyDocument['status']) => {
  const map: Record<PolicyDocument['status'], string> = {
    approved: 'Approved', pending: 'Pending Approval', draft: 'Draft', rejected: 'Rejected', expired: 'Expired',
  };
  return map[status] ?? status;
};

const approvalIcon = (s: string) => {
  if (s === 'approved') return { icon: 'check_circle', cls: 'text-green-500' };
  if (s === 'rejected') return { icon: 'cancel',       cls: 'text-red-500' };
  return                       { icon: 'radio_button_unchecked', cls: 'text-[#6b7a99]' };
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide">{label}</span>
    <span className="text-sm font-medium text-[#0d121b]">{value || '—'}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const DocumentDetail: React.FC<Props> = ({ docId, onBack }) => {
  const [, forceUpdate] = useState(0);
  const [approvalNote, setApprovalNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'changes' | null>(null);

  const doc = getDocById(docId);

  const handleApprovalAction = useCallback((action: 'approve' | 'reject' | 'changes') => {
    if (!doc) return;
    if (action === 'approve')  updateDocStatus(doc.id, 'approved');
    if (action === 'reject')   updateDocStatus(doc.id, 'rejected');
    if (action === 'changes')  updateDocStatus(doc.id, 'draft');
    setConfirmAction(null);
    setApprovalNote('');
    forceUpdate(n => n + 1);
  }, [doc]);

  if (!doc) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">description</span>
          <p className="text-[#6b7a99]">Document not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back to Library</button>
        </div>
      </div>
    );
  }

  const daysToReview = doc.nextReviewDate ? daysUntilDate(doc.nextReviewDate) : null;
  const isOverdue = daysToReview !== null && daysToReview <= 0 && doc.status === 'approved';

  // Re-read from mock array so approval updates reflect
  const freshDoc = MOCK_DOCUMENTS.find(d => d.id === docId) ?? doc;

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 px-4 sm:py-5 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Library
        </button>
        <div className="flex items-start gap-4 flex-wrap flex-col sm:flex-row">
          <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[24px]">description</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#0d121b] leading-tight">{freshDoc.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap ">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">{freshDoc.category}</span>
              <span className="text-xs text-[#6b7a99] font-mono font-medium">Version {freshDoc.version}</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(freshDoc.status)}`}>
                {statusLabel(freshDoc.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {freshDoc.fileName && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overdue alert */}
      {isOverdue && (
        <div className="mx-8 mt-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
          <p className="text-sm font-semibold text-red-700">
            Review overdue — this document was due for review on {formatDate(freshDoc.nextReviewDate)}.
          </p>
        </div>
      )}

      <div className="sm:px-8 px-4 sm:py-6 py-3 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* A) Document Information */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">info</span>
              Document Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <InfoRow label="Owner"           value={freshDoc.owner} />
              <InfoRow label="Department"      value={freshDoc.department} />
              <InfoRow label="Effective Date"  value={formatDate(freshDoc.effectiveDate)} />
              <InfoRow label="Last Review"     value={formatDate(freshDoc.lastReviewDate)} />
              <InfoRow label="Next Review Due" value={formatDate(freshDoc.nextReviewDate)} />
              <InfoRow label="Review Cycle"    value={`Every ${freshDoc.reviewFrequencyMonths} months`} />
            </div>
            {freshDoc.description && (
              <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
                <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-[#0d121b] leading-relaxed">{freshDoc.description}</p>
              </div>
            )}
          </div>

          {/* B) File preview placeholder */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">attach_file</span>
              Document File
            </h2>
            {freshDoc.fileName ? (
              <div className="flex items-center gap-4 p-4 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3]">
                <div className="w-12 h-12 bg-[#2e4150] rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[22px]">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0d121b] truncate">{freshDoc.fileName}</p>
                  <p className="text-xs text-[#6b7a99] mt-0.5">{freshDoc.fileSize} · PDF Document</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center">
                <span className="material-symbols-outlined text-[36px] text-[#e7ebf3] block mb-2">upload_file</span>
                <p className="text-sm text-[#6b7a99]">No file uploaded yet</p>
                <button className="mt-3 text-sm font-semibold text-[#2e4150] hover:underline">Upload File</button>
              </div>
            )}
          </div>

          {/* C) Version History */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3">
            <h2 className="text-base font-bold text-[#0d121b] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">history</span>
              Version History
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#e7ebf3]" />
              <div className="space-y-5">
                {freshDoc.versionHistory.map((ver, i) => {
                  const icon = approvalIcon(ver.approvalStatus);
                  return (
                    <div key={i} className="relative flex gap-4 pl-10">
                      <div className={`absolute left-0 top-0.5 w-9 h-9 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-sm ${
                        i === 0 ? 'ring-2 ring-[#2e4150]/20' : ''
                      }`}>
                        <span className={`material-symbols-outlined text-[18px] ${icon.cls}`}>{icon.icon}</span>
                      </div>
                      <div className="flex-1 bg-[#f6f7fb] rounded-xl p-4 border border-[#e7ebf3]">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#0d121b] font-mono">v{ver.version}</span>
                            {i === 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2e4150] text-white">Current</span>}
                          </div>
                          <span className="text-xs text-[#6b7a99]">{formatDate(ver.date)}</span>
                        </div>
                        <p className="text-xs text-[#6b7a99] mb-1">Uploaded by <span className="font-semibold text-[#0d121b]">{ver.uploadedBy}</span></p>
                        <p className="text-sm text-[#0d121b]">{ver.notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Approval Panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm sm:p-6 p-3">
            <h2 className="text-base font-bold text-[#0d121b] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">fact_check</span>
              Approval Panel
            </h2>
            <p className="text-xs text-[#6b7a99] mb-5">Current status:
              <span className={`ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle(freshDoc.status)}`}>
                {statusLabel(freshDoc.status)}
              </span>
            </p>

            {freshDoc.submittedBy && (
              <div className="mb-5 p-3 bg-[#f6f7fb] rounded-xl border border-[#e7ebf3]">
                <p className="text-xs text-[#6b7a99]">Submitted by</p>
                <p className="text-sm font-semibold text-[#0d121b] mt-0.5">{freshDoc.submittedBy}</p>
                {freshDoc.submittedDate && (
                  <p className="text-xs text-[#6b7a99] mt-0.5">{formatDate(freshDoc.submittedDate)}</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            {confirmAction ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#0d121b]">
                  {confirmAction === 'approve'  && 'Approve this document?'}
                  {confirmAction === 'reject'   && 'Reject this document?'}
                  {confirmAction === 'changes'  && 'Request changes for this document?'}
                </p>
                <textarea
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder="Add a note (optional)…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#f6f7fb] border border-[#e7ebf3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2e4150]/20 resize-none text-[#0d121b] placeholder:text-[#6b7a99]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovalAction(confirmAction)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                      confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      confirmAction === 'reject'  ? 'bg-red-600 hover:bg-red-700' :
                      'bg-[#2e4150] hover:bg-[#3a5268]'
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setConfirmAction(null); setApprovalNote(''); }}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[#f6f7fb] text-[#6b7a99] hover:bg-[#e7ebf3] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setConfirmAction('approve')}
                  disabled={freshDoc.status === 'approved'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Approve
                </button>
                <button
                  onClick={() => setConfirmAction('reject')}
                  disabled={freshDoc.status === 'rejected'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Reject
                </button>
                <button
                  onClick={() => setConfirmAction('changes')}
                  disabled={freshDoc.status === 'draft'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-[#e7ebf3] text-[#2e4150] bg-white hover:bg-[#f6f7fb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Request Changes
                </button>
              </div>
            )}
          </div>

          {/* Review info card */}
          {freshDoc.nextReviewDate && (
            <div className={`rounded-xl border shadow-sm p-5 ${
              isOverdue                                       ? 'bg-red-50 border-red-200' :
              daysToReview !== null && daysToReview <= 30    ? 'bg-amber-50 border-amber-200' :
              'bg-white border-[#e7ebf3]'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[18px] ${
                  isOverdue                                       ? 'text-red-500' :
                  daysToReview !== null && daysToReview <= 30    ? 'text-amber-500' :
                  'text-[#6b7a99]'
                }`}>event</span>
                <p className="text-sm font-bold text-[#0d121b]">Next Review</p>
              </div>
              <p className={`text-base font-bold ${
                isOverdue                                       ? 'text-red-600' :
                daysToReview !== null && daysToReview <= 30    ? 'text-amber-600' :
                'text-[#0d121b]'
              }`}>
                {formatDate(freshDoc.nextReviewDate)}
              </p>
              {daysToReview !== null && (
                <p className="text-xs text-[#6b7a99] mt-1">
                  {daysToReview <= 0
                    ? `${Math.abs(daysToReview)} day(s) overdue`
                    : `In ${daysToReview} day(s)`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
