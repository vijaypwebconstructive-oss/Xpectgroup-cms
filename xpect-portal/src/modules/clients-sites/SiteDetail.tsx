import React, { useState, useRef } from 'react';
import { useClientsSites } from '../../context/ClientsSitesContext';
import type { SiteComplianceDocument } from './types';

interface SiteDetailProps {
  siteId: string;
  onBack: () => void;
}

const RISK_STYLES = {
  Low:    { badge: 'bg-green-100 text-green-700 border border-green-200' },
  Medium: { badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
  High:   { badge: 'bg-red-100 text-red-700 border border-red-200' },
};

const COMPLIANCE_STYLES = {
  Compliant:        { badge: 'bg-green-100 text-green-700 border border-green-200',  dot: 'bg-green-500',  label: 'Compliant' },
  Expiring:         { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-400',  label: 'Expiring' },
  'Non-Compliant':  { badge: 'bg-red-100 text-red-700 border border-red-200',        dot: 'bg-red-500',    label: 'Not Eligible for Site' },
};

const COMPLIANCE_DOCS = [
  { key: 'rams',   label: 'RAMS Document',        icon: 'health_and_safety' },
  { key: 'emergency', label: 'Emergency Procedures', icon: 'emergency' },
  { key: 'siteInstructions', label: 'Site Instructions', icon: 'list_alt' },
] as const;

const PREVIEWABLE_EXT = /\.(pdf|png|jpg|jpeg)$/i;
const PREVIEWABLE_MIME = /^(application\/pdf|image\/(png|jpeg|jpg))/i;
const isPreviewable = (name: string, dataUrl: string): boolean => {
  const ext = name ? PREVIEWABLE_EXT.test(name) : false;
  const mime = dataUrl.startsWith('data:') && PREVIEWABLE_MIME.test(dataUrl.split(';')[0]);
  return ext || mime;
};
const isPdf = (name: string, dataUrl: string): boolean => {
  const lower = name?.toLowerCase() ?? '';
  return lower.endsWith('.pdf') || dataUrl.startsWith('data:application/pdf');
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId, onBack }) => {
  const { getSiteById, getClientById, getAssignmentsBySite, deleteSite, updateSiteCompliance } = useClientsSites();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewDoc, setViewDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [viewError, setViewError] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const site        = getSiteById(siteId);
  const client      = site ? getClientById(site.clientId) : undefined;
  const assignments = site ? getAssignmentsBySite(siteId) : [];

  const complianceDocs = site?.complianceDocuments ?? [];
  const getDocByKey = (key: string) => complianceDocs.find(d => d.key === key);

  const handleDelete = async () => {
    try {
      await deleteSite(siteId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  const handleUpload = async (key: string, file: File) => {
    if (!site) return;
    setUploadingKey(key);
    try {
      const dataUrl = await fileToDataUrl(file);
      const existing = complianceDocs.filter(d => d.key !== key);
      const updated = [...existing, { key, name: file.name, dataUrl }];
      await updateSiteCompliance(siteId, updated);
    } catch {
      // Could show error
    } finally {
      setUploadingKey(null);
      if (fileInputRefs.current[key]) (fileInputRefs.current[key] as HTMLInputElement).value = '';
    }
  };

  const openViewer = (doc: SiteComplianceDocument) => {
    setViewDoc({ name: doc.name, dataUrl: doc.dataUrl });
    setViewError(false);
  };

  if (!site) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <p className="text-[#6b7a99]">Site not found.</p>
    </div>
  );

  const rs           = RISK_STYLES[site.riskLevel];
  const nonCompliant = assignments.filter(a => a.complianceStatus === 'Non-Compliant');

  return (
    <div className="flex-1 flex flex-col bg-[#f6f7fb] min-h-screen">

      {/* Page header */}
      <div className=" p-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Sites
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0d121b] text-xl  sm:text-[30px] font-bold   font-black">{site.name}</h1>
            <p className="text-[#6b7a99] text-sm mt-0.5">{client?.name ?? '—'} · {site.postcode}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${rs.badge}`}>
              {site.riskLevel} Risk
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="delete-site-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-site-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Site</h3>
            <p className="text-sm text-[#6b7a99] mb-6">Are you sure you want to delete &quot;{site.name}&quot;? This will also remove all worker assignments to this site. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-0 py-5 space-y-5">

        {/* Non-compliant alert */}
        {nonCompliant.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
            <p className="text-red-800 text-sm font-semibold">
              {nonCompliant.length} worker{nonCompliant.length > 1 ? 's are' : ' is'} not eligible for this site due to missing required training.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left col */}
          <div className="space-y-5">
            {/* Site Information */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Site Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Full Address',      value: site.address },
                  { label: 'Postcode',          value: site.postcode },
                  { label: 'Emergency Contact', value: site.emergencyContact },
                  { label: 'Emergency Phone',   value: site.emergencyPhone },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold text-[#6b7a99] mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-[#0d121b]">{item.value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-semibold text-[#6b7a99] mb-0.5">Access Instructions</p>
                  <p className="text-sm text-[#0d121b] leading-relaxed">{site.accessInstructions}</p>
                </div>
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Compliance Documents</h3>
              <div className="space-y-2">
                {COMPLIANCE_DOCS.map(docDef => {
                  const doc = getDocByKey(docDef.key);
                  const hasDoc = !!doc?.dataUrl;
                  return (
                    <div key={docDef.key} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3] gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[#6b7a99] text-[17px] shrink-0">{docDef.icon}</span>
                        <p className="text-sm font-medium text-[#0d121b]">{docDef.label}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasDoc ? (
                          <>
                            <button
                              onClick={() => openViewer(doc!)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              View
                            </button>
                            <span className="text-[#c7d2e0]">|</span>
                            <label className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                              {uploadingKey === docDef.key ? 'Uploading…' : 'Replace'}
                              <input
                                ref={el => { fileInputRefs.current[docDef.key] = el; }}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(docDef.key, f); }}
                              />
                            </label>
                          </>
                        ) : (
                          <label className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                            {uploadingKey === docDef.key ? 'Uploading…' : 'Upload'}
                            <input
                              ref={el => { fileInputRefs.current[docDef.key] = el; }}
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(docDef.key, f); }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Required Trainings */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide mb-4">Required Trainings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {site.requiredTrainings.map(training => (
                  <div key={training} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e7ebf3]">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                    <p className="text-sm font-medium text-[#0d121b]">{training}</p>
                    <span className="ml-auto text-xs font-bold text-red-600 uppercase">Required</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Workers */}
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e7ebf3] flex items-center gap-3">
                <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Assigned Workers</h3>
                <span className="text-xs font-bold bg-[#f0f2f7] text-[#6b7a99] px-2.5 py-1 rounded-full">{assignments.length}</span>
              </div>

              {assignments.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">person_off</span>
                  <p className="text-[#6b7a99] text-sm font-semibold">No workers assigned to this site</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f0f2f7]">
                  {assignments.map(a => {
                    const cs = COMPLIANCE_STYLES[a.complianceStatus];
                    const missingTrainings = site.requiredTrainings.filter(t => !a.completedTrainings.includes(t));
                    return (
                      <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full ${a.workerAvatarColor} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-xs font-black">{a.workerInitials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#0d121b]">{a.workerName}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${cs.badge}`}>
                              {cs.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b7a99] mt-0.5">{a.role}</p>
                          {missingTrainings.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {missingTrainings.map(t => (
                                <span key={t} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-medium">
                                  Missing: {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-doc-viewer-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3] shrink-0">
              <h3 id="site-doc-viewer-title" className="text-lg font-bold text-[#0d121b] truncate pr-4">
                {viewDoc.name}
              </h3>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-[#f6f7fb] transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[24px] text-[#6b7a99]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#f8fafc] min-h-[400px]">
              {!viewDoc.dataUrl ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">description</span>
                  <p className="text-[#4c669a] font-semibold">Unable to preview document. Please download the file.</p>
                </div>
              ) : viewError || !isPreviewable(viewDoc.name, viewDoc.dataUrl) ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#c7c7c7] block mb-3">description</span>
                  <p className="text-[#4c669a] font-semibold">Unable to preview document. Please download the file.</p>
                </div>
              ) : isPdf(viewDoc.name, viewDoc.dataUrl) ? (
                <iframe
                  src={viewDoc.dataUrl}
                  title={viewDoc.name}
                  className="w-full min-h-[500px] border border-[#e7ebf3] rounded-lg bg-white"
                  style={{ minHeight: '60vh' }}
                />
              ) : (
                <img
                  src={viewDoc.dataUrl}
                  alt={viewDoc.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                  onError={() => setViewError(true)}
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e7ebf3] flex items-center justify-between gap-3 flex-wrap">
              {viewDoc.dataUrl && (
                <a
                  href={viewDoc.dataUrl}
                  download={viewDoc.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download
                </a>
              )}
              <button
                onClick={() => setViewDoc(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#e7ebf3] text-[#0d121b] text-sm font-bold hover:bg-[#f6f7fb] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDetail;
