import React, { useState, useRef } from 'react';
import { useRiskCoshh } from '../../context/RiskCoshhContext';
import api from '../../services/api';

interface Props {
  ramsId: string;
  onBack: () => void;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXT = /\.(pdf|png|jpg|jpeg)$/i;
const ALLOWED_MIME = /^(application\/pdf|image\/(png|jpeg|jpg))/i;

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });

const isPdf = (name: string, dataUrl: string): boolean => {
  const lower = name?.toLowerCase() ?? '';
  return lower.endsWith('.pdf') || dataUrl.startsWith('data:application/pdf');
};

const RAMSDetail: React.FC<Props> = ({ ramsId, onBack }) => {
  const { getRAMSById, deleteRAMS, updateRAMS, refreshRAMS } = useRiskCoshh();
  const rams = getRAMSById(ramsId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docData, setDocData] = useState<string | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDelete = async () => {
    try {
      await deleteRAMS(ramsId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  const handleViewDoc = async () => {
    if (rams?.documentAvailable) {
      try {
        const full = await api.riskCoshh.rams.getById(ramsId) as { documentData?: string };
        setDocData(full.documentData ?? null);
      } catch {
        setDocData(null);
      }
    } else {
      setDocData(null);
    }
    setShowDocViewer(true);
  };

  const handleReplaceDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ramsId) return;
    setReplaceError(null);
    if (!ALLOWED_EXT.test(file.name) && !ALLOWED_MIME.test(file.type)) {
      setReplaceError('Only PDF, PNG, JPG, JPEG are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setReplaceError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setReplacing(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await updateRAMS(ramsId, {
        documentData: dataUrl,
        signedDocumentFileName: file.name,
      });
      await refreshRAMS();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setReplaceError('Failed to replace document. Please try again.');
    } finally {
      setReplacing(false);
    }
  };

  if (!rams) {
    return (
      <div className="min-h-full bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-[#e7ebf3] block mb-3">assignment</span>
          <p className="text-[#6b7a99]">RAMS document not found</p>
          <button onClick={onBack} className="mt-4 text-sm text-[#2e4150] font-semibold hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f7fb]">

      {/* Header */}
      <div className="bg-white border-b border-[#e7ebf3] px-8 py-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a99] hover:text-[#0d121b] transition-colors mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to RAMS
        </button>
        <div className="flex items-start gap-4 flex-wrap justify-between">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-[#2e4150] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[22px]">assignment</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0d121b]">{rams.siteName}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-sm text-[#6b7a99]">{rams.clientName}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7ebf3] text-sm font-semibold text-[#2e4150] bg-white hover:bg-[#f6f7fb] transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download PDF
            </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0d121b] mb-2">Delete RAMS</h3>
            <p className="text-sm text-[#6b7a99] mb-6">Are you sure you want to delete &quot;{rams.siteName}&quot;? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-5">

          {/* Site information */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">location_on</span>
              Site Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Site Name',      value: rams.siteName },
                { label: 'Client',         value: rams.clientName },
                { label: 'Supervisor',     value: rams.supervisor },
                { label: 'Working Hours',  value: rams.workingHours },
                { label: 'Last Updated',   value: fmt(rams.lastUpdated) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#0d121b]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#e7ebf3]">
              <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1.5">Work Description</p>
              <p className="text-sm text-[#0d121b] leading-relaxed">{rams.description}</p>
            </div>
          </div>

          {/* Step-by-step method */}
          {rams.workMethod.length > 0 && (
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
              <h2 className="text-base font-bold text-[#0d121b] mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">format_list_numbered</span>
                Step-by-Step Work Method
              </h2>
              <div className="space-y-3">
                {rams.workMethod.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#2e4150] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#0d121b] leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency procedures */}
          {rams.emergencyProcedures.length > 0 && (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-500">emergency</span>
                Emergency Procedures
              </h2>
              <div className="space-y-3">
                {rams.emergencyProcedures.map((proc, i) => {
                  const [heading, ...rest] = proc.split(':');
                  return (
                    <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 mt-0.5">priority_high</span>
                      <div>
                        <span className="text-sm font-bold text-red-700">{heading}:</span>
                        <span className="text-sm text-[#0d121b]"> {rest.join(':')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Signed RAMS Document */}
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#0d121b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6b7a99]">upload_file</span>
              Signed RAMS Document
            </h2>
            {rams.signedCopyAvailable ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="material-symbols-outlined text-green-500 text-[22px]">check_circle</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0d121b]">Signed copy available</p>
                    {rams.signedDocumentFileName && (
                      <p className="text-xs text-[#6b7a99] mt-0.5">File: {rams.signedDocumentFileName}</p>
                    )}
                    {rams.signedDocumentUploadedAt && (
                      <p className="text-xs text-[#6b7a99]">Uploaded: {fmt(rams.signedDocumentUploadedAt)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {rams.documentAvailable !== false ? (
                    <>
                      <button
                        type="button"
                        onClick={handleViewDoc}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        View
                      </button>
                      <span className="text-[#c7d2e0]">|</span>
                      <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                        {replacing ? 'Uploading…' : 'Replace'}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleReplaceDoc}
                        />
                      </label>
                    </>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      {replacing ? 'Uploading…' : 'Upload'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={handleReplaceDoc}
                      />
                    </label>
                  )}
                </div>
                {replaceError && (
                  <p className="text-xs text-red-600 font-medium">{replaceError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-6 border-2 border-dashed border-[#e7ebf3] rounded-xl text-center">
                  <span className="material-symbols-outlined text-[32px] text-[#e7ebf3] block mb-2">upload_file</span>
                  <p className="text-sm font-semibold text-[#0d121b]">No signed copy</p>
                  <p className="text-xs text-[#6b7a99] mt-1">Upload signed RAMS document (PDF, PNG, JPG, JPEG)</p>
                </div>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#2e4150] text-[#2e4150] text-sm font-semibold hover:bg-[#2e4150]/5 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {replacing ? 'Uploading…' : 'Upload File'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleReplaceDoc}
                  />
                </label>
                {replaceError && (
                  <p className="text-xs text-red-600 font-medium text-center">{replaceError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document viewer modal - shows on screen, no redirect */}
      {showDocViewer && rams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDocViewer(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <h3 className="text-lg font-bold text-[#0d121b] truncate pr-4">
                {rams.signedDocumentFileName || `Signed RAMS — ${rams.siteName}`}
              </h3>
              <button onClick={() => setShowDocViewer(false)} className="p-1.5 rounded-lg hover:bg-[#f6f7fb] transition-colors shrink-0">
                <span className="material-symbols-outlined text-[24px] text-[#6b7a99]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[#f8fafc] min-h-[300px]">
              {docData ? (
                isPdf(rams.signedDocumentFileName || '', docData) ? (
                  <iframe
                    src={docData}
                    title="RAMS Document"
                    className="w-full min-h-[70vh] border border-[#e7ebf3] rounded-lg bg-white"
                  />
                ) : (
                  <img
                    src={docData}
                    alt={rams.signedDocumentFileName || 'RAMS Document'}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                  />
                )
              ) : rams.documentAvailable ? (
                <div className="text-center py-12 text-[#6b7a99]">
                  <span className="material-symbols-outlined text-[48px] block mb-3">description</span>
                  <p>Document preview not available.</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-[#0d121b] space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Site</p>
                    <p className="font-semibold">{rams.siteName}</p>
                    <p className="text-sm text-[#6b7a99]">{rams.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Work Description</p>
                    <p>{rams.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-1">Working Hours</p>
                    <p>{rams.workingHours}</p>
                  </div>
                  {rams.workMethod.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#6b7a99] uppercase tracking-wide mb-2">Step-by-Step Method</p>
                      <ol className="list-decimal list-inside space-y-2">
                        {rams.workMethod.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {rams.emergencyProcedures.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Emergency Procedures</p>
                      <ul className="space-y-1.5">
                        {rams.emergencyProcedures.map((proc, i) => (
                          <li key={i} className="text-sm">{proc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-[#6b7a99] pt-4">Last updated: {fmt(rams.lastUpdated)}</p>
                </div>
              )}
            </div>
            {docData && (
              <div className="px-6 py-4 border-t border-[#e7ebf3] flex items-center justify-end gap-3">
                <a
                  href={docData}
                  download={rams.signedDocumentFileName || 'rams-document'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </a>
                <button
                  onClick={() => setShowDocViewer(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f6f7fb] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RAMSDetail;
