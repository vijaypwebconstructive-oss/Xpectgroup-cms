import React, { useState, useRef, useEffect } from 'react';
import { useClientsSites, contractHealth, daysUntil } from '../../context/ClientsSitesContext';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onSelectSite: (siteId: string) => void;
}

const STATUS_STYLES = {
  Valid:    { badge: 'bg-green-100 text-green-700 border border-green-200',  label: 'Active' },
  Expiring: { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  label: 'Expiring Soon' },
  Expired:  { badge: 'bg-red-100 text-red-700 border border-red-200',        label: 'Expired' },
};

const COMPLIANCE_STYLES = {
  Compliant:        { badge: 'bg-green-100 text-green-700 border border-green-200',  dot: 'bg-green-500' },
  Expiring:         { badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-400' },
  'Non-Compliant':  { badge: 'bg-red-100 text-red-700 border border-red-200',        dot: 'bg-red-500' },
};

const RISK_STYLES = {
  Low:    'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  High:   'bg-red-100 text-red-700 border border-red-200',
};

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }); }
  catch { return d; }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface DocEntry {
  key: string;
  label: string;
  icon: string;
  desc: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

const DOC_DEFINITIONS: DocEntry[] = [
  { key: 'sla',         label: 'Service Level Agreement (SLA)', icon: 'description',      desc: 'Upload the signed SLA document.' },
  { key: 'insurance',   label: 'Public Liability Insurance',    icon: 'shield',            desc: 'Current insurance certificate.' },
  { key: 'risk',        label: 'Risk Assessment',               icon: 'health_and_safety', desc: 'Site risk assessment document.' },
  { key: 'contract',    label: 'Contract Agreement',            icon: 'gavel',             desc: 'Signed contract PDF.' },
  { key: 'healthSafety',label: 'Health & Safety Policy',        icon: 'local_hospital',    desc: 'Company health & safety policy.' },
  { key: 'gdpr',        label: 'GDPR / Data Agreement',         icon: 'lock',              desc: 'Data protection agreement.' },
];

const clientDocStore: Record<string, Record<string, UploadedFile>> = {};

type Tab = 'overview' | 'sites' | 'workers' | 'documents';

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack, onSelectSite }) => {
  const { getClientById, getSitesByClient, getAssignmentsByClient, deleteClient } = useClientsSites();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docs, setDocs] = useState<Record<string, UploadedFile>>({});
  const [previewDoc, setPreviewDoc] = useState<{ label: string; file: UploadedFile } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const client = getClientById(clientId);

  useEffect(() => {
    const fromApi = (client?.documents || []).reduce<Record<string, UploadedFile>>((acc, d) => {
      acc[d.key] = {
        name: d.name,
        size: d.size,
        type: d.type,
        uploadedAt: d.uploadedAt,
        url: d.dataUrl || '',
      };
      return acc;
    }, {});
    const fromStore = clientDocStore[clientId] || {};
    setDocs({ ...fromApi, ...fromStore });
  }, [clientId, client?.documents]);

  const handleDelete = async () => {
    try {
      await deleteClient(clientId);
      setShowDeleteConfirm(false);
      onBack();
    } catch {
      // Could show error toast
    }
  };

  if (!client) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <p className="text-[#6b7a99]">Client not found.</p>
    </div>
  );

  const sites       = getSitesByClient(clientId);
  const assignments = getAssignmentsByClient(clientId);
  const health      = contractHealth(client);
  const ss          = STATUS_STYLES[health];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',  label: `Overview` },
    { key: 'sites',     label: `Sites (${sites.length})` },
    { key: 'workers',   label: `Workers (${assignments.length})` },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f6f7fb] min-h-screen">

      {/* Page header */}
      <div className="  px-0  py-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6b7a99] text-sm font-semibold hover:text-[#0d121b] transition-colors cursor-pointer mb-3">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Clients
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0d121b] text-xl  sm:text-[30px] font-bold font-black">{client.name}</h1>
            <p className="text-[#6b7a99] text-sm mt-0.5">{client.industry} · {client.contactPerson}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${ss.badge}`}>
              {ss.label}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="delete-client-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 id="delete-client-title" className="text-lg font-bold text-[#0d121b] mb-2">Delete Client</h3>
            <p className="text-sm text-[#6b7a99] mb-6">
              Are you sure you want to delete &quot;{client.name}&quot;? This will also delete all associated sites and worker assignments. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer">Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#e7ebf3] text-[#2e4150] text-sm font-semibold hover:bg-[#f6f7fb] cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-0 py-6 space-y-5">

        {/* Meta strip */}
        <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4">
            {[
              { label: 'Email',            value: client.email },
              { label: 'Phone',            value: client.phone },
              { label: 'Contract Start',   value: formatDate(client.contractStart) },
              { label: 'Contract End',     value: formatDate(client.contractEnd),     warn: daysUntil(client.contractEnd) < 30 },
              { label: 'Insurance Expiry', value: formatDate(client.insuranceExpiry), warn: daysUntil(client.insuranceExpiry) < 30 },
            ].map(item => (
              <div key={item.label} className="min-w-0">
                <p className="text-xs font-semibold text-[#6b7a99] mb-1">{item.label}</p>
                <p className={`text-sm font-bold truncate ${item.warn ? 'text-amber-600' : 'text-[#0d121b]'}`} title={item.value}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-white border border-[#e7ebf3] rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'bg-[#2e4150] text-white shadow-sm'
                  : 'text-[#6b7a99] hover:bg-[#f6f7fb]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 space-y-3">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Contract Summary</h3>
              {[
                { label: 'Total Sites',    value: String(sites.length) },
                { label: 'Total Workers',  value: String(assignments.length) },
                { label: 'Non-Compliant',  value: String(assignments.filter(a => a.complianceStatus === 'Non-Compliant').length) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#f0f2f7] last:border-0">
                  <p className="text-sm text-[#6b7a99] font-medium">{item.label}</p>
                  <p className="text-sm font-bold text-[#0d121b]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm p-5 space-y-3">
              <h3 className="text-[#0d121b] font-black text-sm uppercase tracking-wide">Notes</h3>
              <p className="text-sm text-[#0d121b] leading-relaxed">{client.notes ?? 'No notes on file.'}</p>
            </div>
          </div>
        )}

        {/* Tab: Sites */}
        {activeTab === 'sites' && (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            {sites.length === 0 ? (
              <div className="py-14 text-center">
                <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">location_off</span>
                <p className="text-[#6b7a99] text-sm font-semibold">No sites for this client</p>
              </div>
            ) : (
              <table className="w-full min-w-[550px]">
                <thead>
                  <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                    <th className="text-left px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Site Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Address</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Risk</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Workers</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f7]">
                  {sites.map(site => (
                    <tr key={site.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-[#0d121b]">{site.name}</td>
                      <td className="px-4 py-4 text-sm text-[#6b7a99]">{site.postcode}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase ${RISK_STYLES[site.riskLevel]}`}>
                          {site.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#0d121b]">{site.activeWorkers}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectSite(site.id)}
                          className="text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors uppercase tracking-wide cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Workers */}
        {activeTab === 'workers' && (
          <div className="bg-white rounded-xl border border-[#e7ebf3] shadow-sm overflow-hidden">
            {assignments.length === 0 ? (
              <div className="py-14 text-center">
                <span className="material-symbols-outlined text-[#c7c7c7] text-4xl block mb-2">person_off</span>
                <p className="text-[#6b7a99] text-sm font-semibold">No workers assigned</p>
              </div>
            ) : (
              <table className="w-full min-w-[550px]">
                <thead>
                  <tr className="border-b border-[#e7ebf3] bg-[#f8fafc]">
                    <th className="text-left px-6 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Assigned Site</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#6b7a99] uppercase tracking-wider">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f7]">
                  {assignments.map(a => {
                    const cs = COMPLIANCE_STYLES[a.complianceStatus];
                    return (
                      <tr key={a.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${a.workerAvatarColor} flex items-center justify-center shrink-0`}>
                              <span className="text-white text-xs font-black">{a.workerInitials}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0d121b]">{a.workerName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#6b7a99] font-medium">{a.siteName}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#0d121b]">{a.role}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${cs.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                            {a.complianceStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOC_DEFINITIONS.map(doc => {
                const uploaded = docs[doc.key];
                return (
                  <div key={doc.key} className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 transition-all ${uploaded ? 'border-green-200' : 'border-[#e7ebf3]'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-green-50' : 'bg-[#f0f2f7]'}`}>
                      <span className={`material-symbols-outlined text-[20px] ${uploaded ? 'text-green-600' : 'text-[#6b7a99]'}`}>{doc.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0d121b]">{doc.label}</p>

                      {uploaded ? (
                        <div className="mt-1.5 space-y-2">
                          <div className="flex items-center gap-2 bg-[#f8fafc] rounded-lg px-3 py-2 border border-[#e7ebf3]">
                            <span className="material-symbols-outlined text-[16px] text-green-600">attach_file</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0d121b] truncate">{uploaded.name}</p>
                              <p className="text-[10px] text-[#6b7a99]">{formatFileSize(uploaded.size)} · Uploaded {uploaded.uploadedAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors cursor-pointer">
                              <span className="material-symbols-outlined text-[14px]">upload</span>
                              Re-upload
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                ref={el => { fileInputRefs.current[doc.key + '-re'] = el; }}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const entry: UploadedFile = {
                                      name: file.name,
                                      size: file.size,
                                      type: file.type,
                                      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                                      url: URL.createObjectURL(file),
                                    };
                                    setDocs(prev => {
                                      const next = { ...prev, [doc.key]: entry };
                                      clientDocStore[clientId] = next;
                                      return next;
                                    });
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            <span className="text-[#e7ebf3]">|</span>
                            <button
                              onClick={() => {
                                setDocs(prev => {
                                  const next = { ...prev };
                                  delete next[doc.key];
                                  clientDocStore[clientId] = next;
                                  return next;
                                });
                              }}
                              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-[#6b7a99] mt-0.5">{doc.desc}</p>
                          <label className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer w-fit">
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                            Upload Document
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              ref={el => { fileInputRefs.current[doc.key] = el; }}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const entry: UploadedFile = {
                                    name: file.name,
                                    size: file.size,
                                    type: file.type,
                                    uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                                    url: URL.createObjectURL(file),
                                  };
                                  setDocs(prev => {
                                    const next = { ...prev, [doc.key]: entry };
                                    clientDocStore[clientId] = next;
                                    return next;
                                  });
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${uploaded ? 'text-green-700 bg-green-50 border border-green-200' : 'text-[#9aa5be] bg-[#f8fafc] border border-[#e7ebf3]'}`}>
                        {uploaded ? 'Uploaded' : 'Not uploaded'}
                      </span>
                      <button
                        onClick={() => uploaded && setPreviewDoc({ label: doc.label, file: uploaded })}
                        disabled={!uploaded}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                          uploaded
                            ? 'border-[#2e4150]/30 bg-[#2e4150] text-white hover:bg-[#3a5268]'
                            : 'border-[#e7ebf3] bg-[#f6f7fb] text-[#9aa5be] cursor-not-allowed opacity-70'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document preview modal */}
            {previewDoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7ebf3]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-[22px] text-[#2e4150]">description</span>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-[#0d121b] truncate">{previewDoc.label}</h2>
                        <p className="text-xs text-[#6b7a99]">{previewDoc.file.name} · {formatFileSize(previewDoc.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={previewDoc.file.url}
                        download={previewDoc.file.name}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2e4150] text-white text-xs font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Download
                      </a>
                      <button
                        onClick={() => setPreviewDoc(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f6f9] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#4c669a]">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    {previewDoc.file.type.startsWith('image/') ? (
                      <img src={previewDoc.file.url} alt={previewDoc.file.name} className="max-w-full max-h-[60vh] mx-auto rounded-xl shadow-sm" />
                    ) : previewDoc.file.type === 'application/pdf' ? (
                      <iframe src={previewDoc.file.url} title={previewDoc.file.name} className="w-full h-[60vh] rounded-xl border border-[#e7ebf3]" />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="material-symbols-outlined text-[60px] text-[#c7d2e0] mb-3">article</span>
                        <p className="text-sm font-bold text-[#0d121b]">{previewDoc.file.name}</p>
                        <p className="text-xs text-[#6b7a99] mt-1">{formatFileSize(previewDoc.file.size)} · Uploaded {previewDoc.file.uploadedAt}</p>
                        <p className="text-xs text-[#6b7a99] mt-3">Preview not available for this file type.</p>
                        <a
                          href={previewDoc.file.url}
                          download={previewDoc.file.name}
                          className="mt-4 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#2e4150] text-white text-sm font-bold hover:bg-[#2e4150]/90 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-[#9aa5be] pb-4">
          © 2024 Xpect Group. All worker records are encrypted and stored in compliance with GDPR regulations.
        </p>
      </div>
    </div>
  );
};

export default ClientDetail;
