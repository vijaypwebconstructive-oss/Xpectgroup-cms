import React from 'react';
import { usePolicyDocuments } from '../../context/PolicyDocumentsContext';
import { PolicyDocument } from './types';

interface Props {
  onSelectDoc: (id: string) => void;
  onBack: () => void;
}

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DocumentApprovals: React.FC<Props> = ({ onSelectDoc, onBack }) => {
  const { documents, updateDocument } = usePolicyDocuments();
  const [processing, setProcessing] = React.useState<string | null>(null);

  const pending = documents.filter(d => d.status === 'pending');

  const handle = async (doc: PolicyDocument, action: 'approved' | 'rejected') => {
    setProcessing(doc.id);
    try {
      await updateDocument(doc.id, { status: action });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] sm:px-8 sm:py-5 px-4 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Library
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">pending_actions</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0d121b]">Document Approvals</h1>
              <p className="text-base text-[#4c669a]">{pending.length} document{pending.length !== 1 ? 's' : ''} awaiting approval</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:px-8 px-4 sm:py-6 py-3">

        {/* Info banner */}
        <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-blue-500 text-[20px] shrink-0 mt-0.5">info</span>
          <p className="text-sm text-blue-700">
            Review each document carefully before approving. Approved documents become live policy and will be visible to all relevant staff.
            Click a document title to view its full details.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-[56px] text-green-300 block mb-4">task_alt</span>
            <p className="text-lg font-bold text-[#0d121b]">All caught up!</p>
            <p className="text-sm text-[#6b7a99] mt-2">No documents are currently awaiting approval.</p>
            <button
              onClick={onBack}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#2e4150] text-white text-sm font-semibold hover:bg-[#3a5268] transition-colors"
            >
              Return to Library
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e7ebf3] bg-[#f6f7fb]">
                    {['Document', 'Category', 'Version', 'Submitted By', 'Submitted Date', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6b7a99] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3]">
                  {pending.map(doc => (
                    <tr key={doc.id} className="hover:bg-[#f6f7fb] transition-colors">
                      <td className="px-5 py-4">
                        <button
                          onClick={() => onSelectDoc(doc.id)}
                          className="text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">description</span>
                            <span className="font-semibold text-[#2e4150] group-hover:underline max-w-[220px] truncate">{doc.title}</span>
                          </div>
                          <p className="text-xs text-[#6b7a99] mt-0.5 ml-[26px]">{doc.department}</p>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0f2f7] text-[#2e4150]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#0d121b] font-mono font-medium">v{doc.version}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {(doc.submittedBy ?? doc.owner).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[#0d121b]">{doc.submittedBy ?? doc.owner}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#6b7a99] whitespace-nowrap">
                        {formatDate(doc.submittedDate ?? '')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handle(doc, 'approved')}
                            disabled={processing === doc.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {processing === doc.id ? (
                              <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px]">check</span>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handle(doc, 'rejected')}
                            disabled={processing === doc.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            Reject
                          </button>
                          <button
                            onClick={() => onSelectDoc(doc.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e7ebf3] text-xs font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentApprovals;
